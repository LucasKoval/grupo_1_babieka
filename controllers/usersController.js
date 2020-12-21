//----------* REQUIRE'S *----------//
const bcrypt = require('bcryptjs');
const helper = require('../helpers/helper');
const {check, validationResult, body} = require('express-validator');


//----------* USERS CONTROLLER *----------//
const usersController = {
    // Renderiza la vista Listado de Usuarios
    usersFullList: (req, res) => {
        const users = helper.getAllUsers();
		const admin = users.filter((user) => {
			return user.category == 'admin';
		});
		const client = users.filter((user) => {
			return user.category == 'client';
		});
		res.render('users/usersFullList', {
			adminUsers: admin,
            clientUsers: client,
        });
        console.log('ADMINITRADORES: '+ adminUsers);
        console.log('CLIENTES: '+ clientUsers);       
    },
    
    // Renderiza la vista Registro
    registerForm: (req, res) => {        
        return res.render('users/register');
    },

    // Crea un nuevo Usuario 
    createUser: (req, res) =>{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.render('users/register', {
                errors: errors.errors,
                email : req.body.email
            })
        }

        const users = helper.getAllUsers();
        const passwordHashed = bcrypt.hashSync(req.body.password, 5);
        const user = {
            id: helper.getNewUserId(),
            firstName: req.body.firstName,
            lastName: req.body.lastName, 
            email: req.body.email,
            password: passwordHashed,
            category: req.body.category,
            image: req.files[0].filename
        }
        const usersToSave = [...users,user];
        helper.writeUsers(usersToSave);
        return res.redirect('/usuario/login');
    },

    // Renderiza la vista Login
    loginForm: (req, res) => {        
        res.render('users/login');
    },

    processLogin: (req ,res) => {
        // Verifica que no existan errores al hacer el login
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.render('users/login', {
                errors: errors.errors,
                email : req.body.email
            })
        }

        // Verifica que exista el usuario en la DB
        const email = req.body.email;
		const password = req.body.password;
        const users = helper.getAllUsers();
        const userExist = users.find(user => user.email == email);
        // Ejecuta el login si existe el usuario en la DB y que las contraseñas coincidan
        if (userExist && bcrypt.compareSync(password, userExist.password)) {
            req.session.user = userExist;
            if (req.body.remember) {
                res.cookie('user_Id', userExist.id, { maxAge: 1000 * 60 * 30 });
            }
            return res.redirect('/usuario/perfil');
        }

        // En caso de ser "false", redirecciona al login
        res.redirect('/usuario/login');
    },

    // Renderiza la vista Perfil de usuario
    profile: (req, res) => {
		res.render('users/profile');
    },

    // Renderiza la vista Edición de Perfil
    editForm: (req, res) => {    
        const email = req.body.email;
        const users = helper.getAllUsers();
        const user = users.find(user => user.email == email)    
        return res.render('users/editUser', { user:user });
    },

    // Edita el perfil de un Usuario
    editProfile: (req, res) => { 
        const passwordHashed = bcrypt.hashSync(req.body.password, 5);
        const users = helper.getAllUsers();
        const editedUser = users.map(function(user){
            if (req.session.user.id == user.id) {
                user.firstName = req.body.firstName; 
                user.lastName = req.body.lastName;
                user.email = req.body.email;
                user.password = passwordHashed;
                user.category = req.body.category;
                user.image = req.files[0].filename;
            } 
            return user
        })
        helper.writeUsers(editedUser);
        res.redirect('/usuario/perfil');       
    },

    // Elimina el perfil de un usuario
    delete: (req, res) => {        
        const users = helper.getAllUsers();
        const remainingUsers = users.filter((user) => {
			return user.id != req.session.user.id;
        });
        helper.writeUsers(remainingUsers);
        req.session.destroy();
        res.clearCookie('user_Id');
        return res.redirect('/usuario/registro');
    },

    logout: (req, res) => {        
        req.session.destroy();
        res.clearCookie('user_Id');
        return res.redirect('/usuario/login');
    }
};

//----------* EXPORTS CONTROLLER *----------//
module.exports = usersController;