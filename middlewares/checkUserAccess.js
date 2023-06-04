const Models = require('./../models');
const User = Models.User;

const checkUserAccess = async (req, res, next) => {
    try {
    const { email } = req.body;
      const userIsBloced = await User.findOne({where: {email: email,status: 'blocked'}});
      const userExists = await User.findOne({where: { email: email}});
  
      if (userIsBloced || !userExists) {
        return res.status(403).json({ error: 'Sorry. Access denied you have been blocked or deleted' })
      }
      next();
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
}

module.exports = checkUserAccess