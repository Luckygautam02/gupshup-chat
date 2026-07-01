const User = require("../Models/User"); // Make sure the path is correct

// Function to search users by name or email
const allUsers = async (req, res) => {
  // Get the search query from the URL
  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};

  try {
    // Find users matching the keyword, BUT exclude the currently logged-in user
    const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
    res.status(200).send(users);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { allUsers };
