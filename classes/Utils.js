class Utils {
    static dateFormat(date, locale) {
        return `${date.toLocaleDateString(locale)} ${date.getHours()}:${date.getMinutes()}`
    }
}