const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')

const cryptPassword = async(password) => {
    const salt = await bcrypt.genSalt(5)

    return bcrypt.hash(password, salt)
}

const prisma = new PrismaClient();

module.exports = {
    registerUser: async(req, res) => {
        const user = await prisma.users.create({
            data: {
                name: req.body.name,
                email: req.body.email,
                password: await cryptPassword(req.body.password),
                profile: {
                    create: {
                        identity_number: req.body.identity_number,
                        identity_type: req.body.identity_type,
                        address: req.body.address,
                    }
                }
            }
        });

        return res.json({
            data: user
        })
    },
    loginUser: async(req, res) => {
        const findUser = await prisma.users.findFirst({
            where: {
                email: req.body.email
            }
        })
        if (!findUser) {
            return res.status(404).json({
                error: 'User not exists'
            });
        }
        if (bcrypt.compareSync(req.body.password, findUser.password)) {
            const token = jwt.sign({ id: findUser.id }, 'secret_key', { expiresIn: '6h' })

            return res.status(200).json({
                data: {
                    token
                }
            })
        }
        return res.status(403).json({
            error: 'Invalid Password'
        })
    },
    getProfile: async(req, res) => {
        const user = await prisma.users.findUnique({
            where: {
                id: res.user.id
            }
        })
        return res.status(200).json({
            data: user
        })

    },
    getUser: async(req, res) => {
        const user = await prisma.users.findMany();
        res.send(user);
    },

    getUserdetail: async(req, res) => {
        const id = parseInt(req.params.id);
        const user = await prisma.users.findUnique({
            where: { id: id },
            include: { profile: true }, // Meng-include profil dalam hasil
        });
        return res.json({
            data: user,
            message: "user data find"
        });
    },
    editUser: async(req, res) => {
        const id = req.params.id;
        const userData = req.body;

        if (!(userData.email && userData.name && userData.password)) {
            res.status(400).send("Some field Missing");
            return
        }

        const users = await prisma.users.update({
            where: {
                id: parseInt(id)
            },
            data: {
                name: userData.name,
                email: userData.email,
                password: userData.password
            }
        })
        res.json({
            data: users,
            message: "edit user done"
        })
    },
    deleteUser: async(req, res) => {
        try {
            const profiles = await prisma.profiles.delete({
                where: {
                    id: Number(req.params.id),
                },

            });

            const user = await prisma.users.delete({
                where: {
                    id: Number(req.params.id),
                },
                include: {
                    profile: profiles
                }
            });
            return res.status(200).json({
                data: user,
                message: "user deleted"
            });

        } catch (error) {
            res.status(400).json({ msg: error.message });
        }

    }
}