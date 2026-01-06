# מדריך העלאה ל-GitHub (GitHub Upload Guide)

הפרויקט שלך מוכן לעבוד עם GitHub!
מכיוון שאין לי גישה ישירה לחשבון שלך, יצרתי את כל התשתית במחשב שלך (Local Repository).
כעת עליך לבצע את הפעולה האחרונה כדי לחבר אותו לענן.

---

### שלב 1: הרצת הסקריפט האוטומטי 🛠️

1. נווט לתיקיית הפרויקט שלך:
   `C:\Users\rlexe\OneDrive\שולחן העבודה\ANTIGRAVITY TASKS\Realfield pro`
2. מצא את הקובץ **`setup_git.bat`**.
3. לחץ עליו פעמיים (**Double Click**).
   - יפתח חלון שחור שירוץ לכמה שניות.
   - כתוב בו "Git Repository Initialized Successfully".
   - לחץ על מקש כלשהו כדי לסגור אותו.

---

### שלב 2: יצירת Repository חדש ב-GitHub 🌐

1. כנס לאתר [GitHub.com](https://github.com) והתחבר לחשבון שלך.
2. לחץ על כפתור ה-**+** למעלה מימין ובחר **New repository**.
3. תן שם לפרויקט (למשל: `realfield-pro`).
4. **חשוב:** אל תסמן את האפשרויות "Initialize this repository with...". השאר אותן ריקות.
5. לחץ על **Create repository**.

---

### שלב 3: חיבור והעלאה (השלב האחרון) 🚀

1. פתח את הטרמינל (Terminal) בתיקיית הפרויקט (אוVS Code).
2. העתק והדבק את הפקודות הבאות (אחת אחרי השנייה), אך **החלף את הכתובת** בשורה הראשונה לכתובת שקיבלת מ-GitHub בשלב הקודם:

```bash
# החלף את הכתובת למטה לכתובת האמיתית שלך!
git remote add origin https://github.com/YOUR_USERNAME/realfield-pro.git

git branch -M main
git push -u origin main
```

3. אם תתבקש, הכנס שם משתמש וסיסמה של GitHub.

---

### זהו! הפרויקט באוויר. 🎉
כל הקוד, כולל המערכת החכמה (Gemini AI) והעיצוב החדש, שמור ומגובה.
