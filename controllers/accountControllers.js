const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

module.exports = {
    registerAccounts: async(req, res) => {
        const { bank_name, bank_account_number, balance, user_id } = req.body;

        try {
            const existingUser = await prisma.users.findUnique({
                where: { id: parseInt(user_id) },
            });

            if (!existingUser) {
                return res.status(404).json({ error: true, message: "User Not Found" });
            }

            const response = await prisma.bank_accounts.create({
                data: {
                    bank_name: bank_name,
                    bank_account_number: bank_account_number,
                    balance: BigInt(balance),
                    user: {
                        connect: { id: parseInt(user_id) },
                    },
                },
            });

            const balanceInt = parseInt(balance);

            return res.status(201).json({
                error: false,
                message: "Create account Successfully",
                data: {
                    ...response,
                    balance: balanceInt,
                },
            });
        } catch (error) {
            console.log(error);
            return res
                .status(500)
                .json({ error: true, message: "Internal Server Error" });
        }
    },
    getAccounts: async(req, res) => {
        try {
            const accounts = await prisma.bank_accounts.findMany();

            const response = accounts.map((account) => {
                return {
                    ...account,
                    balance: parseInt(account.balance),
                };
            });

            return res.status(201).json({
                error: false,
                message: "Fetched data bank account successfully",
                data: response,
            });
        } catch (error) {
            console.log(error);
            return res
                .status(500)
                .json({ error: true, message: "Internal Server Error" });
        }
    },
    getAccountsId: async(req, res) => {
        const id = parseInt(req.params.id);

        try {
            const account = await prisma.bank_accounts.findUnique({
                where: {
                    id: id,
                },
                include: {
                    user: true,
                },
            });

            if (!account) {
                return res.status(404).json({ error: 'Account not found!' });
            }

            const accountData = {
                id: account.id,
                bank_name: account.bank_name,
                bank_account_number: account.bank_account_number,
                balance: Number(account.balance),
                user: account.user,
            };

            return res.json({
                data: accountData,
                message: "account data find"
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Error fetching account details!' });
        }
    },

    editAccount: async(req, res) => {
        const id = req.params.id;
        const accounData = req.body;

        if (!(accounData.bank_name && accounData.bank_account_number && accounData.balance)) {
            res.status(400).send("Some field Missing");
            return
        }
        const accounts = await prisma.bank_accounts.update({
            where: {
                id: parseInt(id)
            },
            data: {
                bank_name: accounData.bank_name,
                bank_account_number: accounData.bank_account_number,
                balance: parseInt(accounData.balance)
            }
        })
        res.json({
            data: accounts,
            message: "edit account done"
        })
    },
    deleteAccount: async(req, res) => {
        const id = req.params.id;

        try {
            await prisma.bank_accounts.delete({
                where: {
                    id: parseInt(id),
                },
            });

            return res.json({
                message: 'Bank account deleted',
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Error deleting bank account!' });
        }
    },
}