# Page snapshot

```yaml
- generic [ref=e4]:
  - generic [ref=e5]:
    - img [ref=e8]
    - heading "LOST&FOUND" [level=1] [ref=e10]
    - paragraph [ref=e11]: Neural Recovery System
  - generic [ref=e12]:
    - heading "Welcome Back" [level=2] [ref=e13]
    - generic [ref=e14]: Network error. Please check your connection.
    - generic [ref=e15]:
      - generic [ref=e16]:
        - generic [ref=e17]: Email
        - textbox "you@amrita.edu" [ref=e18]: student@example.com
      - generic [ref=e19]:
        - generic [ref=e20]: Password
        - generic [ref=e21]:
          - textbox "••••••••" [ref=e22]: Student@123
          - button [ref=e23] [cursor=pointer]:
            - img [ref=e24]
      - button "Sign In" [ref=e27] [cursor=pointer]
    - generic [ref=e28]:
      - link "Don't have an account? Register" [ref=e29] [cursor=pointer]:
        - /url: /register
      - link "Visitor? Get temporary access" [ref=e30] [cursor=pointer]:
        - /url: /register-visitor
      - link "← Back to Home" [ref=e31] [cursor=pointer]:
        - /url: /
  - generic [ref=e32]:
    - paragraph [ref=e33]: Test Credentials (Development Only)
    - generic [ref=e34]:
      - paragraph [ref=e35]: "Student: student@example.com / Student@123"
      - paragraph [ref=e36]: "Faculty: faculty@example.com / Faculty@123"
      - paragraph [ref=e37]: "Admin: admin@example.com / Admin@123"
```