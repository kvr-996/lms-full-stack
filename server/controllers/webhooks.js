import { Webhook } from "svix";
import User from "../models/User.js";

export const clerkWebHooks = async (req, res) => {
  try {
    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
    await whook.verify(JSON.stringify(req.body), {
      "svix-id": req.headers["svix-id"],
      "svix-signature": req.headers["svix-signature"],
      "svix-timestamp": req.headers["svix-timestamp"],
    });
    const { data, type } = req.body;
    switch (type) {
      case "user.created": {
        const userData = {
          _id: data.id,
          email: data.email_addresses[0].email_address,
          name: data.first_name + " " + data.last_name,
          imageUrl: data.imageUrl,
        };
        await User.create(userData);
        res.json({ success: true });
        break;
      }
      case "user.updated": {
        const userData = {
          email: data.email_address[0].email_address,
          name: data.first_name + " " + data.last_name,
          imageUrl: data.imageUrl,
        };
        await User.findByIdAndUpdate(data.id, userData);
        res.json({ success: true });
        break;
      }
      case "user.deleted": {
        await User.findByIdAndDelete(data.id);
        res.json({ success: true });
        break;
      }
      default:
        break;
    }
  } catch (error) {
    res.json({ success: true, message: error.message });
  }
};
