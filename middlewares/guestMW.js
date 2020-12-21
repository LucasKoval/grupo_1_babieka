//----------* MIDDLEWARE *----------//
module.exports = (req, res, next) => {
    if (req.session.user) {
        res.redirect('/usuario/perfil');
    }
    return next();
}