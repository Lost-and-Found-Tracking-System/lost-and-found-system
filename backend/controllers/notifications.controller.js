export const getNotifications = (req, res) => {
  res.status(200).json([
    {
      id: 1,
      message: "Your lost item request has been approved",
      type: "success",
      createdAt: new Date(),
    },
    {
      id: 2,
      message: "New item matching your claim found",
      type: "info",
      createdAt: new Date(),
    },
  ]);
};
