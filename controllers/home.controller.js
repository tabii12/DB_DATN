const getHomeDocument = async () => {
  let home = await Home.findOne();
  if (!home) {
    home = await Home.create({});
  }
  return home;
};

const updateFields = (target, body, fields) => {
  fields.forEach((field) => {
    if (body[field] !== undefined) {
      target[field] = body[field];
    }
  });
};

const replaceImage = async (oldPublicId, files, folder) => {
  if (!files?.length) return null;

  if (oldPublicId) {
    await cloudinary.uploader.destroy(oldPublicId);
  }

  const uploaded = await uploadMultipleImages(files, folder);

  return uploaded[0];
};

const createHome = async (req, res) => {
  const home = await Home.create(req.body);
  res.json(home);
};

const getHome = async (req, res) => {
  try {
    let home = await Home.findOne();

    if (!home) {
      home = await Home.create({});
    }

    return res.json({
      success: true,
      data: home,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const addBanner = async (req, res) => {
  try {
    const home = await Home.findOne();
    if (!home) return res.status(404).json({ message: "Home not found" });

    const uploaded = await uploadMultipleImages(
      req.files,
      "pick_your_way/home/banners",
    );

    home.banners.push(...uploaded);
    await home.save();

    res.json({ success: true, data: home.banners });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateBanner = async (req, res) => {
  try {
    const { banner_id } = req.params;
    const home = await Home.findOne();

    const banner = home.banners.id(banner_id);
    if (!banner) return res.status(404).json({ message: "Banner not found" });

    if (req.files?.length) {
      await cloudinary.uploader.destroy(banner.public_id);

      const uploaded = await uploadMultipleImages(
        req.files,
        "pick_your_way/home/banners",
      );

      banner.image_url = uploaded[0].image_url;
      banner.public_id = uploaded[0].public_id;
    }

    await home.save();

    res.json({ success: true, data: banner });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteBanner = async (req, res) => {
  try {
    const { banner_id } = req.params;
    const home = await Home.findOne();

    const banner = home.banners.id(banner_id);
    if (!banner) return res.status(404).json({ message: "Banner not found" });

    await cloudinary.uploader.destroy(banner.public_id);

    banner.remove();
    await home.save();

    res.json({ success: true, message: "Deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addCombo = async (req, res) => {
  try {
    const home = await Home.findOne();

    const uploaded = await uploadMultipleImages(
      req.files,
      "pick_your_way/home/combos",
    );

    const newCombo = {
      ...req.body,
      image_url: uploaded[0]?.image_url,
      public_id: uploaded[0]?.public_id,
    };

    home.combos.push(newCombo);
    await home.save();

    res.json({ success: true, data: home.combos });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateCombo = async (req, res) => {
  try {
    const { combo_id } = req.params;

    const home = await getHomeDocument();
    const combo = home.combos.id(combo_id);

    if (!combo) return res.status(404).json({ message: "Combo not found" });

    // Update text fields
    updateFields(combo, req.body, [
      "name",
      "location",
      "slug",
      "price",
      "stars",
      "tag",
      "nights",
      "discount_percent",
      "amenities",
    ]);

    // Update image nếu có
    const newImage = await replaceImage(
      combo.public_id,
      req.files,
      "pick_your_way/home/combos",
    );

    if (newImage) {
      combo.image_url = newImage.image_url;
      combo.public_id = newImage.public_id;
    }

    await home.save();

    res.json({
      success: true,
      data: combo,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteCombo = async (req, res) => {
  try {
    const { combo_id } = req.params;

    const home = await getHomeDocument();
    const combo = home.combos.id(combo_id);

    if (!combo) return res.status(404).json({ message: "Combo not found" });

    if (combo.public_id) {
      await cloudinary.uploader.destroy(combo.public_id);
    }

    combo.remove();
    await home.save();

    res.json({
      success: true,
      message: "Deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addStyle = async (req, res) => {
  try {
    const home = await Home.findOne();
    if (!home) return res.status(404).json({ message: "Home not found" });

    const uploaded = await uploadMultipleImages(
      req.files,
      "pick_your_way/home/styles",
    );

    const newStyle = {
      title: req.body.title,
      subtitle: req.body.subtitle,
      count: req.body.count,
      href: req.body.href,
      color: req.body.color,
      image_url: uploaded[0]?.image_url,
      public_id: uploaded[0]?.public_id,
    };

    home.styles.push(newStyle);
    await home.save();

    res.status(201).json({
      success: true,
      data: home.styles,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateStyle = async (req, res) => {
  try {
    const { style_id } = req.params;

    const home = await getHomeDocument();
    const style = home.styles.id(style_id);

    if (!style) return res.status(404).json({ message: "Style not found" });

    // update text fields
    updateFields(style, req.body, [
      "title",
      "subtitle",
      "count",
      "href",
      "color",
    ]);

    // update image nếu có
    const newImage = await replaceImage(
      style.public_id,
      req.files,
      "pick_your_way/home/styles",
    );

    if (newImage) {
      style.image_url = newImage.image_url;
      style.public_id = newImage.public_id;
    }

    await home.save();

    res.json({
      success: true,
      data: style,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteStyle = async (req, res) => {
  try {
    const { style_id } = req.params;

    const home = await getHomeDocument();
    const style = home.styles.id(style_id);

    if (!style) return res.status(404).json({ message: "Style not found" });

    if (style.public_id) {
      await cloudinary.uploader.destroy(style.public_id);
    }

    style.remove();
    await home.save();

    res.json({
      success: true,
      message: "Deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addDestination = async (req, res) => {
  try {
    const home = await Home.findOne();
    if (!home) return res.status(404).json({ message: "Home not found" });

    const uploaded = await uploadMultipleImages(
      req.files,
      "pick_your_way/home/destinations",
    );

    const newDestination = {
      name: req.body.name,
      slug: req.body.slug,
      hotel_count: req.body.hotel_count,
      image_url: uploaded[0]?.image_url,
      public_id: uploaded[0]?.public_id,
    };

    home.destinations.push(newDestination);
    await home.save();

    res.status(201).json({
      success: true,
      data: home.destinations,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateDestination = async (req, res) => {
  try {
    const { destination_id } = req.params;
    const home = await Home.findOne();

    const destination = home.destinations.id(destination_id);
    if (!destination)
      return res.status(404).json({ message: "Destination not found" });

    ["name", "slug", "hotel_count"].forEach((field) => {
      if (req.body[field] !== undefined) {
        destination[field] = req.body[field];
      }
    });

    if (req.files?.length) {
      await cloudinary.uploader.destroy(destination.public_id);

      const uploaded = await uploadMultipleImages(
        req.files,
        "pick_your_way/home/destinations",
      );

      destination.image_url = uploaded[0]?.image_url;
      destination.public_id = uploaded[0]?.public_id;
    }

    await home.save();

    res.json({
      success: true,
      data: destination,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteDestination = async (req, res) => {
  try {
    const { destination_id } = req.params;
    const home = await Home.findOne();

    const destination = home.destinations.id(destination_id);
    if (!destination)
      return res.status(404).json({ message: "Destination not found" });

    await cloudinary.uploader.destroy(destination.public_id);

    destination.remove();
    await home.save();

    res.json({
      success: true,
      message: "Xóa destination thành công",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createHome,
  getHome,
  addBanner,
  updateBanner,
  deleteBanner,
  addCombo,
  updateCombo,
  deleteCombo,
  addStyle,
  updateStyle,
  deleteStyle,
  addDestination,
  updateDestination,
  deleteDestination,
};
