// backend/controllers/ledgerController.js
const prisma = require('../prisma/client');

// Account Controllers
const createAccount = async (req, res) => {
  const { number, name, type } = req.body;
  if (!number || !name || !type) {
    return res.status(400).json({ message: 'Please provide account number, name, and type' });
  }
  try {
    const accountExists = await prisma.account.findUnique({ where: { number } });
    if (accountExists) {
      return res.status(400).json({ message: 'Account with this number already exists' });
    }
    const account = await prisma.account.create({
      data: { number, name, type },
    });
    res.status(201).json(account);
  } catch (error) {
    console.error('Error creating account:', error);
    res.status(500).json({ message: 'Server error creating account' });
  }
};

const getAccounts = async (req, res) => {
  try {
    const accounts = await prisma.account.findMany({
      orderBy: { number: 'asc' }
    });
    res.status(200).json(accounts);
  } catch (error) {
    console.error('Error fetching accounts:', error);
    res.status(500).json({ message: 'Server error fetching accounts' });
  }
};

// Ledger Entry Controllers
const createLedgerEntry = async (req, res) => {
  const { date, description, amount, accountId } = req.body;
  if (!date || !description || amount === undefined || accountId === undefined) {
    return res.status(400).json({ message: 'Please provide date, description, amount, and accountId' });
  }
  try {
    // Check if account exists
    const account = await prisma.account.findUnique({ where: { id: parseInt(accountId) } });
    if (!account) {
      return res.status(400).json({ message: 'Account not found' });
    }

    const ledgerEntry = await prisma.ledgerEntry.create({
      data: {
        date: new Date(date), // Ensure date is in ISO format from client or parse appropriately
        description,
        amount: parseFloat(amount),
        accountId: parseInt(accountId),
      },
    });
    res.status(201).json(ledgerEntry);
  } catch (error) {
    console.error('Error creating ledger entry:', error);
    res.status(500).json({ message: 'Server error creating ledger entry' });
  }
};

const getLedgerEntries = async (req, res) => {
  try {
    const ledgerEntries = await prisma.ledgerEntry.findMany({
      include: { account: true }, // Include related account details
      orderBy: { date: 'desc' },
    });
    res.status(200).json(ledgerEntries);
  } catch (error) {
    console.error('Error fetching ledger entries:', error);
    res.status(500).json({ message: 'Server error fetching ledger entries' });
  }
};

module.exports = {
  createAccount,
  getAccounts,
  createLedgerEntry,
  getLedgerEntries,
};
