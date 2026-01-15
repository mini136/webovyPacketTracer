# Page snapshot

```yaml
- generic [ref=e5]:
  - heading "Registrace" [level=2] [ref=e6]
  - generic [ref=e7]:
    - generic [ref=e8]:
      - text: "Uživatelské jméno:"
      - textbox "Uživatelské jméno:" [ref=e9]: testuser1768220331933
    - generic [ref=e10]:
      - text: "Email:"
      - textbox "Email:" [ref=e11]: test1768220331933@example.com
    - generic [ref=e12]:
      - text: "Heslo:"
      - textbox "Heslo:" [ref=e13]: Test123456!
    - generic [ref=e14]:
      - text: "Potvrdit heslo:"
      - textbox "Potvrdit heslo:" [active] [ref=e15]
    - button "Zaregistrovat se" [ref=e16] [cursor=pointer]
  - paragraph [ref=e17]:
    - text: Již máte účet?
    - button "Přihlaste se" [ref=e18] [cursor=pointer]
```