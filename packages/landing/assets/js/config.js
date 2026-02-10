(function() {
    var isLocal = window.location.hostname === 'localhost'
              || window.location.hostname === '127.0.0.1';
    window.SV_EXPRESS_API_URL = isLocal
        ? 'http://localhost:3000'
        : 'https://api.sv-express.com';
})();
