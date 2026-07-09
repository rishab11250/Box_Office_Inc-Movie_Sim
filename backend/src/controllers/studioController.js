import Studio from "../models/Studio.js";

/**
 * Updates the studio name of the logged-in user.
 * GET/POST/PUT /api/studios
 */
export const updateStudio = async (req, res) => {
  try {
    const { name } = req.body;
    const studio = await Studio.findOne({ owner: req.user._id });

    if (!studio) {
      return res.status(404).json({
        success: false,
        message: "Studio not found",
      });
    }

    studio.name = name;
    await studio.save();

    return res.status(200).json({
      success: true,
      message: "Studio name updated successfully",
      studio,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getStudio = async (req, res) => {
  try {
    const studio = await Studio.findOne({ owner: req.user._id });

    if (!studio) {
      return res.status(404).json({
        success: false,
        message: "Studio not found",
      });
    }

    return res.status(200).json({
      success: true,
      studio,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
