const Transaction = require('../models/transaction');
const User = require('../models/user');
const router = require('express').Router();
router.post('/action', async (req, res) => {
    try {
        let {
            acc_number,
            amount,
            description,
            comment,
            trans_type
        } = req.body;
        amount = Number(amount);
        const user = await User.findOne({ phone_number: acc_number });
        let newBalance = 0.0;
        let prevBalance = Number(user.balance);

        // validate and perform deposit;
        if (trans_type === 'deposit') {
            if (!(amount > 0)) {
                return res.render("pages/feedback", { msg: 'Amount cannot be empty' });
            }
            newBalance = prevBalance + amount
        }
        // validate and perform withdrawal
        if (trans_type === 'withdraw') {
            if (!(prevBalance - amount > 0)) {
                return res.render("pages/feedback",{ msg: 'You cannot withdraw at this time, Please check your balance' });
            }
            newBalance = prevBalance - amount;
        }
         
        // Update database and record transaction
        await User.updateOne(
        { phone_number: acc_number }, { $set: { 'balance': newBalance } }
        );
        const record = await Transaction.create({ acc_number, date: new Date(), amount, description, comment, trans_type });
        await User.updateOne({ _id: user.id }, { $push: { "records": record } });
        
        res.render("pages/feedback", { msg: `Current balance is ${newBalance}` });
    
    } catch (err) {
       res.render("pages/feedback", { msg: 'An error has occured during this transaction' })
    }
})

router.post('/balance', async (req, res) => {
    try {
        //Identify user
        const { acc_number } = req.body;
        const user = await User.findOne({ phone_number: acc_number });
        
        // Record transaction and update database
        const record = await Transaction.create({ acc_number, date: new Date(), amount: 0, description: 'N/A', comment: 'N/A', trans_type: 'balance' });
        await User.updateOne({ _id: user.id }, { $push: { "records": record } });
       res.render("pages/feedback", { msg: `Your balance is ${user.balance}` });
    } catch (err) {
        res.render("pages/feedback", { msg: 'Error Checking balance' });
    }
});

router.post('/transfer', async (req, res) => {
    try {
        const {
            send_acc,
            rec_acc,
            amount,
            description,
            comment
        } = req.body;
        let newSenderBal = 0;
        let newReceiverBal = 0;
        const sender = await User.findOne({ phone_number: send_acc });
        const receiver = await User.findOne({ phone_number: rec_acc });
        
        // Sender
        if (!(Number(sender.balance) - Number(amount) > 0 && amount > 0)) {
            res.render("pages/feedback", { msg: 'Check your balance before sending money.' });
        }

        // New Sender balance
        newSenderBal = Number(sender.balance) - Number(amount);

        // New Receiver balance
        newReceiverBal = Number(receiver.balance) + Number(amount);

        // Update Sender's record and record transaction
        if (send_acc === sender.phone_number) {
            await User.updateOne(
                { _id: sender.id}, { $set: { 'balance': newSenderBal } }
            );
            const record_s = await Transaction.create({ acc_number: send_acc, date: Date(), amount, description, comment, trans_type: 'transfer' });
            await User.updateOne({ _id: sender.id }, { $push: { "records": record_s } });
        }

        // Update Receiver's record and record transaction
        if (receiver.phone_number === rec_acc) {
            await User.updateOne(
                { _id: receiver.id }, { $set: { 'balance': newReceiverBal } }
            );
            const record_r = await Transaction.create({ acc_number: sender.phone_number, date: Date(), amount, description, comment, trans_type: 'deposit' });
            await User.updateOne({ _id: receiver.id }, { $push: { "records": record_r } });
        }
        res.render("pages/feedback", { msg: 'Transfer Successful' });
    } catch (err) {
        res.render("pages/feedback", { msg: 'Error Making Transfer' });
    }
})

router.get("/records", async (req, res) => {
    try {
        const { acc_number } = req.query;
        const result = await User.findOne({ phone_number: acc_number }, { "records": 1 })
        const records = await Transaction.find({ "_id": { "$in": result["records"] } })
        res.render('pages/list', { data: records });
    } catch (err) {
        res.render("pages/feedback", { msg: 'Error getting transaction list' });
    }
})
module.exports = router;
