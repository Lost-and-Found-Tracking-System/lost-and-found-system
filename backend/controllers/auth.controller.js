export const register = (req, res) => {
  console.log("REGISTER BODY:", req.body);

  const { name, email, phone, password } = req.body;

  if (!name || !email || !phone || !password) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields",
    });
  }

  return res.status(201).json({
    success: true,
    message: "Registration successful",
    data: { name, email, phone },
    token: "dummy-jwt-token",
  });
};
