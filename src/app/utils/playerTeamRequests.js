import { calculatePlayerScore } from './teamStats'

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

        // Rule 1: If Aidan Butterworth is playing, Kim Butterworth MUST also be playing
        const aidanButterworth = playingPlayers.find(p => p.name === "Aidan Butterworth")
        const kimButterworthPlaying = playingPlayers.find(p => p.name === "Kim Butterworth")

        if (aidanButterworth && !kimButterworthPlaying) {
            // Find Kim in the full player list
            const kimButterworthFromDB = allPlayers.find(p => p.name === "Kim Butterworth")

            if (kimButterworthFromDB) {
                // Add Kim to the playing list with her stats
                modifiedPlayers.push({
                    ...kimButterworthFromDB,
                    isPlayingThisWeek: true
                })
            } else {
                console.warn('Kim Butterworth not found in player database')
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
        const kimButterworth = players.find(p => p.name === "Kim Butterworth")
        const janDmowski = players.find(p => p.name === "Jan Dmowski")
        const sandraPanajotow = players.find(p => p.name === "Sandra Panajotow")
        const robFreeman = players.find(p => p.name === "Rob Freeman")
        const lawrenceDavis = players.find(p => p.name === "Lawrence Davis")
        const samMasri = players.find(p => p.name === "Sam Masri")
        const joeBarbieri = players.find(p => p.name === "Joe Barbieri")

        // Rule 2: If Kim Butterworth is playing, make sure she is NOT on the same team as Jan Dmowski
        if (kimButterworth && janDmowski) {
            const kimButterworthTeam = teams.find(t => t?.players?.some(p => p.name === "Kim Butterworth"))
            const janDmowskiTeam = teams.find(t => t?.players?.some(p => p.name === "Jan Dmowski"))

            if (kimButterworthTeam && janDmowskiTeam && kimButterworthTeam === janDmowskiTeam) {
                // They're on the same team, need to separate them by swapping
                const janIndex = kimButterworthTeam.players.findIndex(p => p.name === "Jan Dmowski")

                if (janIndex !== -1) {
                    // Find another team to swap with
                        const otherTeam = teams.find(t => t !== kimButterworthTeam && Array.isArray(t?.players) && t.players.length > 0)

                    if (otherTeam) {
                        // Find best swap candidate from the other team
                        const swapCandidate = findBestSwapCandidate(janDmowski, otherTeam.players)

                        if (swapCandidate) {
                            // Perform the swap
                            const swapCandidateIndex = otherTeam.players.findIndex(p => p.name === swapCandidate.name)

                            // Remove both players from their current teams
                            kimButterworthTeam.players.splice(janIndex, 1)
                            otherTeam.players.splice(swapCandidateIndex, 1)

                            // Add them to their new teams
                            otherTeam.players.push(janDmowski)
                            kimButterworthTeam.players.push(swapCandidate)

                        } else {
                            console.warn('Could not find suitable swap candidate for Jan Dmowski')
                        }
                    } else {
                        console.warn('Could not find another team to swap Jan Dmowski')
                    }
                }
            }
        }

        // Rule 3: If Sandra Panajotow and Rob Freeman are both playing, they should be on the SAME team
        if (sandraPanajotow && robFreeman) {
            const sandraPanajotowTeam = teams.find(t => t?.players?.some(p => p.name === "Sandra Panajotow"))
            const robFreemanTeam = teams.find(t => t?.players?.some(p => p.name === "Rob Freeman"))

            if (sandraPanajotowTeam && robFreemanTeam && sandraPanajotowTeam !== robFreemanTeam) {
                // They're on different teams, swap Rob with someone from Sandra's team
                const robIndex = robFreemanTeam.players.findIndex(p => p.name === "Rob Freeman")

                if (robIndex !== -1) {
                    // Find best swap candidate from Sandra's team
                    const swapCandidate = findBestSwapCandidate(robFreeman, sandraPanajotowTeam.players)

                    if (swapCandidate) {
                        const swapCandidateIndex = sandraPanajotowTeam.players.findIndex(p => p.name === swapCandidate.name)

                        // Remove both players from their current teams
                        robFreemanTeam.players.splice(robIndex, 1)
                        sandraPanajotowTeam.players.splice(swapCandidateIndex, 1)

                        // Add them to their new teams
                        sandraPanajotowTeam.players.push(robFreeman)
                        robFreemanTeam.players.push(swapCandidate)

                    } else {
                        console.warn('Could not find suitable swap candidate for Rob Freeman')
                    }
                }
            }
        }

        // Rule 4: If Lawrence Davis is playing, make sure he is NOT on the same team as BOTH Sam Masri AND Joe Barbieri
        if (lawrenceDavis && samMasri && joeBarbieri) {
            const lawrenceDavisTeam = teams.find(t => t?.players?.some(p => p.name === "Lawrence Davis"))
            const samMasriTeam = teams.find(t => t?.players?.some(p => p.name === "Sam Masri"))
            const joeBarbieriTeam = teams.find(t => t?.players?.some(p => p.name === "Joe Barbieri"))

            // Check if all three are on the same team
            if (lawrenceDavisTeam && samMasriTeam && joeBarbieriTeam &&
                lawrenceDavisTeam === samMasriTeam &&
                lawrenceDavisTeam === joeBarbieriTeam) {

                // All three are on the same team - swap Lawrence with someone from a different team
                const lawrenceIndex = lawrenceDavisTeam.players.findIndex(p => p.name === "Lawrence Davis")

                if (lawrenceIndex !== -1) {
                    // Find a different team (one that doesn't have Sam AND Joe together)
                    const otherTeam = teams.find(t => t !== lawrenceDavisTeam && Array.isArray(t?.players) && t.players.length > 0)

                    if (otherTeam) {
                        // Find best swap candidate from the other team
                        const swapCandidate = findBestSwapCandidate(lawrenceDavis, otherTeam.players)

                        if (swapCandidate) {
                            const swapCandidateIndex = otherTeam.players.findIndex(p => p.name === swapCandidate.name)

                            // Remove both players from their current teams
                            lawrenceDavisTeam.players.splice(lawrenceIndex, 1)
                            otherTeam.players.splice(swapCandidateIndex, 1)

                            // Add them to their new teams
                            otherTeam.players.push(lawrenceDavis)
                            lawrenceDavisTeam.players.push(swapCandidate)

                        } else {
                            console.warn('Could not find suitable swap candidate for Lawrence Davis')
                        }
                    } else {
                        console.warn('Could not find another team to swap Lawrence Davis')
                    }
                }
            }
            if (lawrenceDavisTeam && joeBarbieriTeam  &&
                lawrenceDavisTeam === joeBarbieriTeam) {
                    const lawrenceIndex = lawrenceDavisTeam.players.findIndex(p => p.name === "Lawrence Davis")

                    if (lawrenceIndex !== -1) {
                        // Find a different team (one that doesn't have Sam AND Joe together)
                        const otherTeam = teams.find(t => t !== lawrenceDavisTeam && Array.isArray(t?.players) && t.players.length > 0)
    
                        if (otherTeam) {
                            // Find best swap candidate from the other team
                            const swapCandidate = findBestSwapCandidate(lawrenceDavis, otherTeam.players)
    
                            if (swapCandidate) {
                                const swapCandidateIndex = otherTeam.players.findIndex(p => p.name === swapCandidate.name)
    
                                // Remove both players from their current teams
                                lawrenceDavisTeam.players.splice(lawrenceIndex, 1)
                                otherTeam.players.splice(swapCandidateIndex, 1)
    
                                // Add them to their new teams
                                otherTeam.players.push(lawrenceDavis)
                                lawrenceDavisTeam.players.push(swapCandidate)
    
                            } else {
                                console.warn('Could not find suitable swap candidate for Lawrence Davis')
                            }
                        } else {
                            console.warn('Could not find another team to swap Lawrence Davis')
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