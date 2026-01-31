import { validationResult } from 'express-validator'

function validate(validationRules) {
  return async (req, res, next) => {
    // Run all validation rules
    await Promise.all(validationRules.map((validation) => validation.run(req)))

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    next()
  }
}

export default validate
