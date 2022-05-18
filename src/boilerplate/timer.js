export function getNextGameTime () {
    var d = new Date();
    d.setHours(24,0,0,0);
    return d;
}

export function getUntil (date) {
    var now = new Date().getTime();
    return {
        hours: Math.floor(((date - now) % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor(((date - now) % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor(((date - now) % (1000 * 60)) / 1000),
    };
}

export function getDay (date) {
    return Math.floor(date / (1000 * 60 * 60 * 24));
}

export function getCurrentDay () {
    return getDay (Date.now());
}
