import { Router } from "express";

var router = Router();

router.post('/vat', 
    async (req, res) => {
    res.send('Hello World')
})

router.get('/vat', async (req, res) => {
    res.send('Hello World')
})

export default router;

