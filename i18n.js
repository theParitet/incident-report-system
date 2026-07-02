// i18n

const SUPPORTED_LANGS = ["en", "ar", "ru"];

const SHA_BOOTSTRAP_INTEGRITY_RTL =
    "sha384-CfCrinSRH2IR6a4e6fy2q6ioOX7O6Mtm1L9vRvFZ1trBncWmMePhzvafv7oIcWiW";
const SHA_BOOTSTRAP_INTEGRITY_LTR =
    "sha384-sRIl4kxILFvY47J16cr9ZwB07vP4J8+LH7qKQnuqkuIAvNWLzeN8tE5YBujZqJLB";

const BOOTSTRAP_CDN_RTL =
    "https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.rtl.min.css";
const BOOTSTRAP_CDN_LTR =
    "https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css";

$(function () {
    const lang = localStorage.getItem("lang") || "ar";

    const changeLang = (lang) => {
        $(document).attr("dir", lang === "ar" ? "rtl" : "ltr");
        $(document).attr("lang", lang);

        // swap the stylesheets
        $("#bootstrap-link").attr(
            "integrity",
            lang === "ar"
                ? SHA_BOOTSTRAP_INTEGRITY_RTL
                : SHA_BOOTSTRAP_INTEGRITY_LTR,
        );
        $("#bootstrap-link").attr(
            "href",
            lang === "ar" ? BOOTSTRAP_CDN_RTL : BOOTSTRAP_CDN_LTR,
        );

        SUPPORTED_LANGS.forEach((language) => {
            $(`#lang-picker-${language}`).removeClass("active");
        });
        $(`#lang-picker-${lang}`).addClass("active");

        localStorage.setItem("lang", lang);
    };

    changeLang(lang);
    SUPPORTED_LANGS.forEach((lang) => {
        $(`#lang-picker-${lang}`).on("click", function () {
            changeLang(lang);
        });
    });
});
