import React from "react";
import "./Footer.css";
import { Link } from "react-router-dom";

const Footer = () => {
    return (
        <footer className="main-footer" dir="rtl">
            <div className="footer-glow-line" />
            <div className="footer-container">
                {/* القسم الأول: العلامة التجارية */}
                <div className="footer-brand">
                    <h2 className="footer-logo">
                        ألعاب<span>ـنا</span>
                    </h2>
                    <p>
                        منصتك الأولى لأكثر الألعاب التفاعلية حماساً وتحدياً مع
                        الأصدقاء.
                    </p>
                    <div className="social-links">
                        <a href="#" aria-label="Discord">
                            <i className="fab fa-discord"></i>
                        </a>
                        <a href="#" aria-label="Twitter">
                            <i className="fab fa-twitter"></i>
                        </a>
                        <a href="#" aria-label="Instagram">
                            <i className="fab fa-instagram"></i>
                        </a>
                    </div>
                </div>

                {/* القسم الثاني: روابط سريعة */}
                <div className="footer-links">
                    <h3>روابط سريعة</h3>
                    <ul>
                        <li>
                            <Link to="/">الرئيسية</Link>
                        </li>
                        <li>
                            <Link to="/trending">الألعاب الشائعة</Link>
                        </li>
                        <li>
                            <Link to="/how-to-play">كيفية اللعب</Link>
                        </li>
                        <li>
                            <Link to="/contact">اتصل بنا</Link>
                        </li>
                    </ul>
                </div>

                {/* القسم الثالث: الاشتراك */}
                <div className="footer-newsletter">
                    <h3>اشترك في النشرة</h3>
                    <p>كن أول من يعرف عند إضافة ألعاب جديدة.</p>
                    <form
                        className="subscribe-form"
                        onSubmit={(e) => e.preventDefault()}>
                        <input type="email" placeholder="بريدك الإلكتروني" />
                        <button type="submit">اشترك</button>
                    </form>
                </div>
            </div>

            <div className="footer-bottom">
                <p>
                    جميع الحقوق محفوظة &copy; {new Date().getFullYear()} مســاؤو
                    كــورة.
                </p>
            </div>
        </footer>
    );
};

export default Footer;
