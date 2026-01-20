import { calculatePlayerScore } from './teamStats'
const PERSON1 = process.env.PERSON1
const PERSON2 = process.env.PERSON2
const PERSON3 = process.env.PERSON3
const PERSON4 = process.env.PERSON4
const PERSON5 = process.env.PERSON5
const PERSON6 = process.env.PERSON6
const PERSON7 = process.env.PERSON7
const PERSON8 = process.env.PERSON8

/**
 * Helper function to find the best swap candidate based on skill level and gender
 * @param {Object} playerToMove - The player being moved
 * @param {Array} destinationTeamPlayers - Players in the destination team
 * @param {boolean} preferSameGender - Whether to prefer same gender (default true)
 * @returns {Object|null} The best player to swap with, or null if no candidates
 */
const findBestSwapCandidate = (playerToMove, destinationTeamPlayers, preferSameGender = true) => {
    if (!destinationTeamPlayers || destinationTeamPlayers.length === 0) {
        return null
    }

    const playerScore = calculatePlayerScore(playerToMove)

    // First, try to find same gender candidates
    let candidates = destinationTeamPlayers
    if (preferSameGender) {
        const sameGenderCandidates = destinationTeamPlayers.filter(
            p => p.gender === playerToMove.gender
        )
        // Use same gender candidates if available, otherwise use all
        candidates = sameGenderCandidates.length > 0 ? sameGenderCandidates : destinationTeamPlayers
    }

    // Find player with closest score
    let closestPlayer = null
    let smallestDiff = Infinity

    candidates.forEach(player => {
        const swappedPlayerScore = calculatePlayerScore(player)
        const playerDiff = Math.abs(swappedPlayerScore - playerScore)

        if (playerDiff < smallestDiff) {
            smallestDiff = playerDiff
            closestPlayer = player
        }
    })

    return closestPlayer
}

/**
 * Phase 1: Apply rules BEFORE team balancing
 * Modifies the player list to ensure certain players are included/excluded
 * @param {Array} allPlayers - All players from the database
 * @param {Array} playingPlayers - Players currently marked as playing
 * @returns {Array} Modified list of players who should be playing
 */
export const applyPreBalanceRules = (allPlayers, playingPlayers) => {
    // Validate inputs
    if (!allPlayers || !Array.isArray(allPlayers)) {
        console.warn('applyPreBalanceRules: Invalid allPlayers array')
        return playingPlayers
    }

    if (!playingPlayers || !Array.isArray(playingPlayers)) {
        console.warn('applyPreBalanceRules: Invalid playingPlayers array')
        return playingPlayers
    }

    try {
        // Create a working copy
        let modifiedPlayers = [...playingPlayers]

        // Rule 1: If Person 1 is playing, PERSON2 MUST also be playing
        const person1 = playingPlayers.find(p => p.name === PERSON1)
        const person2Playing = playingPlayers.find(p => p.name === PERSON2)

        if (person1 && !person2Playing) {
            // Find PERSON2 in the full player list
            const person2FromDB = allPlayers.find(p => p.name === PERSON2)

            if (person2FromDB) {
                // Add PERSON2 to the playing list with her stats
                modifiedPlayers.push({
                    ...person2FromDB,
                    isPlayingThisWeek: true
                })
            } else {
                console.warn(PERSON2 + ' not found in player database')
            }
        }

        return modifiedPlayers

    } catch (error) {
        console.error('Error in applyPreBalanceRules:', error)
        return playingPlayers
    }
}

/**
 * Phase 2: Apply rules AFTER team balancing
 * Rearranges players between teams based on relationship rules
 * @param {Array} players - List of players who are playing
 * @param {Array} teams - Balanced teams to modify
 * @returns {Array} Modified teams with rules applied
 */
export const applyPostBalanceRules = (players, teams) => {
    // Validate inputs
    if (!players || !Array.isArray(players) || players.length === 0) {
        console.warn('applyPostBalanceRules: Invalid or empty players array')
        return teams
    }

    if (!teams || !Array.isArray(teams) || teams.length === 0) {
        console.warn('applyPostBalanceRules: Invalid or empty teams array')
        return teams
    }

    try {
        // Find players who are in the playing list
        const person2 = players.find(p => p.name === PERSON2)
        const person3 = players.find(p => p.name === PERSON3)
        const person4 = players.find(p => p.name === PERSON4)
        const person5 = players.find(p => p.name === PERSON5)
        const person6 = players.find(p => p.name === PERSON6)
        const samMasri = players.find(p => p.name === PERSON8)
        const joeBarbieri = players.find(p => p.name === PERSON7)

        // Rule 2: If PERSON2 is playing, make sure she is NOT on the same team as PERSON3
        if (person2 && person3) {
            const person2Team = teams.find(t => t?.players?.some(p => p.name === PERSON2))
            const person3Team = teams.find(t => t?.players?.some(p => p.name === PERSON3))

            if (person2Team && person3Team && person2Team === person3Team) {
                // They're on the same team, need to separate them by swapping
                const person3Index = person2Team.players.findIndex(p => p.name === PERSON3)

                if (person3Index !== -1) {
                    // Find another team to swap with
                        const otherTeam = teams.find(t => t !== person2Team && Array.isArray(t?.players) && t.players.length > 0)

                    if (otherTeam) {
                        // Find best swap candidate from the other team
                        const swapCandidate = findBestSwapCandidate(person3, otherTeam.players)

                        if (swapCandidate) {
                            // Perform the swap
                            const swapCandidateIndex = otherTeam.players.findIndex(p => p.name === swapCandidate.name)

                            // Remove both players from their current teams
                            person2Team.players.splice(person3Index, 1)
                            otherTeam.players.splice(swapCandidateIndex, 1)

                            // Add them to their new teams
                            otherTeam.players.push(person3)
                            person2Team.players.push(swapCandidate)

                        } else {
                            console.warn('Could not find suitable swap candidate for PERSON3')
                        }
                    } else {
                        console.warn('Could not find another team to swap PERSON3')
                    }
                }
            }
        }

        // Rule 3: If PERSON4 and PERSON5 are both playing, they should be on the SAME team
        if (person4 && person5) {
            const person4Team = teams.find(t => t?.players?.some(p => p.name === person4.name))
            const person5Team = teams.find(t => t?.players?.some(p => p.name === person5.name))

            if (person4Team && person5Team && person4Team !== person5Team) {
                // They're on different teams, swap PERSON5 with someone from PERSON4's team
                const person5Index = person5Team.players.findIndex(p => p.name === person5.name)

                if (person5Index !== -1) {
                    // Find best swap candidate from PERSON4's team
                    const swapCandidate = findBestSwapCandidate(person5, person4Team.players)

                    if (swapCandidate) {
                        const swapCandidateIndex = person4Team.players.findIndex(p => p.name === swapCandidate.name)

                        // Remove both players from their current teams
                        person5Team.players.splice(person5Index, 1)
                        person4Team.players.splice(swapCandidateIndex, 1)

                        // Add them to their new teams
                        person4Team.players.push(person5)
                        person5Team.players.push(swapCandidate)

                    } else {
                        console.warn('Could not find suitable swap candidate for PERSON5')
                    }
                }
            }
        }

        // Rule 4: If PERSON6 is playing, make sure he is NOT on the same team as BOTH PERSON8 AND PERSON7
        if (person6 && samMasri && joeBarbieri) {
            const person6Team = teams.find(t => t?.players?.some(p => p.name === PERSON6))
            const samMasriTeam = teams.find(t => t?.players?.some(p => p.name === PERSON8))
            const joeBarbieriTeam = teams.find(t => t?.players?.some(p => p.name === PERSON7))

            // Check if all three are on the same team
            if (person6Team && samMasriTeam && joeBarbieriTeam &&
                person6Team === samMasriTeam &&
                person6Team === joeBarbieriTeam) {

                // All three are on the same team - swap PERSON6 with someone from a different team
                const person6Index = person6Team.players.findIndex(p => p.name === PERSON6)

                if (person6Index !== -1) {
                    // Find a different team (one that doesn't have PERSON8 AND PERSON7 together)
                    const otherTeam = teams.find(t => t !== person6Team && Array.isArray(t?.players) && t.players.length > 0)

                    if (otherTeam) {
                        // Find best swap candidate from the other team
                        const swapCandidate = findBestSwapCandidate(person6, otherTeam.players)

                        if (swapCandidate) {
                            const swapCandidateIndex = otherTeam.players.findIndex(p => p.name === swapCandidate.name)

                            // Remove both players from their current teams
                            person6Team.players.splice(person6Index, 1)
                            otherTeam.players.splice(swapCandidateIndex, 1)

                            // Add them to their new teams
                            otherTeam.players.push(person6)
                            person6Team.players.push(swapCandidate)

                        } else {
                            console.warn('Could not find suitable swap candidate for PERSON6')
                        }
                    } else {
                        console.warn('Could not find another team to swap PERSON6')
                    }
                }
            }
            if (person6Team && joeBarbieriTeam  &&
                person6Team === joeBarbieriTeam) {
                    const person6Index = person6Team.players.findIndex(p => p.name === PERSON6)

                    if (person6Index !== -1) {
                        // Find a different team (one that doesn't have PERSON8 AND PERSON7 together)
                        const otherTeam = teams.find(t => t !== person6Team && Array.isArray(t?.players) && t.players.length > 0)
    
                        if (otherTeam) {
                            // Find best swap candidate from the other team
                            const swapCandidate = findBestSwapCandidate(person6, otherTeam.players)
    
                            if (swapCandidate) {
                                const swapCandidateIndex = otherTeam.players.findIndex(p => p.name === swapCandidate.name)
    
                                // Remove both players from their current teams
                                person6Team.players.splice(person6Index, 1)
                                otherTeam.players.splice(swapCandidateIndex, 1)
    
                                // Add them to their new teams
                                otherTeam.players.push(person6)
                                person6Team.players.push(swapCandidate)
    
                            } else {
                                console.warn('Could not find suitable swap candidate for PERSON6')
                            }
                        } else {
                            console.warn('Could not find another team to swap PERSON6')
                        }
                    }
                }
        }

    } catch (error) {
        console.error('Error in applyPostBalanceRules:', error)
        // Return original teams if there's an error to prevent breaking the app
        return teams
    }

    // Return deep copy of teams to prevent mutations
    return teams.map(team => ({
        ...team,
        players: [...team.players]
    }))
}

// Legacy export for backward compatibility (now uses post-balance only)
const playerTeamRequests = (players, teams) => {
    return applyPostBalanceRules(players, teams)
}

export default playerTeamRequests