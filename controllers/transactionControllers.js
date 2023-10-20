const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

module.exports = {
    createTransaction: async(req, res) => {
        let { source_account_id, destination_account_id, amount } = req.body;
        source_account_id = parseInt(source_account_id);
        destination_account_id = parseInt(destination_account_id);
        amount = parseInt(amount);

        const existingSourceAccount = await prisma.bank_accounts.findUnique({
            where: {
                id: source_account_id,
            },
        });

        if (source_account_id === destination_account_id) {
            return res.status(400).json({
                error: true,
                message: "source_account_id and destination_account_id must different",
            });
        }

        if (!existingSourceAccount)
            return res
                .status(404)
                .json({ error: true, message: "Source Account Not Found" });

        if (existingSourceAccount.balance < amount) // cek jumlah transaksi
            return res
            .status(404)
            .json({ error: true, message: "Source Account balance is insufficient" });

        const existingDestinationAccount = await prisma.bank_accounts.findUnique({
            where: {
                id: destination_account_id,
            },
        });

        if (!existingDestinationAccount)
            return res
                .status(404)
                .json({ error: true, message: "Destination Account Not Found" });

        await prisma.bank_accounts_transactions
            .create({
                data: {
                    amount: amount,
                    source_account: { connect: { id: source_account_id } }, // Hubungkan dengan akun sumber
                    destination_account: {
                        connect: { id: destination_account_id },
                    },
                },
            })
            .then(() => {
                return prisma.bank_accounts.update({
                    where: { id: source_account_id },
                    data: {
                        balance: {
                            decrement: amount,
                        },
                    },
                });
            })
            .then(() => { //update pada balance setelah transaksi
                return prisma.bank_accounts.update({
                    where: { id: destination_account_id },
                    data: {
                        balance: {
                            increment: amount,
                        },
                    },
                });
            })
            .then(() => {
                return res.status(201).json({
                    error: false,
                    message: "Create Transaction Successfully",
                    data: {
                        source_account_id,
                        destination_account_id,
                        amount,
                    },
                });
            })
            .catch((error) => {
                console.log(error);
                return res
                    .status(500)
                    .json({ error: true, message: "Internal Server Error" });
            });
    },
    getTransactions: async(req, res) => {
        try {
            const transactions = await prisma.bank_accounts_transactions.findMany({
                include: {
                    source_account: true,
                    destination_account: true,
                },
            });

            if (!transactions)
                return res
                    .status(404)
                    .json({ error: true, message: "Transaction Not Found" });

            const response = transactions.map((transaction) => {
                return {
                    transaction_id: parseInt(transaction.id),
                    source_account: parseInt(transaction.source_account_id),
                    destination_account: parseInt(transaction.destination_account_id),
                    amount: parseInt(transaction.amount),
                };
            });

            return res.status(201).json({
                message: "data transaksi ditemukan",
                data: response,
            });
        } catch (error) {
            console.log(error);
            return res
                .status(500)
                .json({ error: true, message: "Internal Server Error" });
        }
    },

    getTransactionsId: async(req, res) => {
        const id = (req.params.id);

        try {
            const transaction = await prisma.bank_accounts_transactions.findUnique({
                where: {
                    id: parseInt(id),
                },
                include: {
                    source_account: true,
                    destination_account: true,
                },
            });

            if (!transaction)
                return res
                    .status(404)
                    .json({ error: true, message: "Transaction Not Found" });

            const response = {
                transaction_id: parseInt(transaction.id),
                source_account: parseInt(transaction.source_account_id),
                destination_account: parseInt(transaction.destination_account_id),
                amount: parseInt(transaction.amount),
            };

            return res.status(201).json({
                error: false,
                message: "Fetched data transaction successfully",
                data: response,
            });
        } catch (error) {
            console.log(error);
            return res
                .status(500)
                .json({ error: true, message: "Internal Server Error" });
        }
    }
}