const express = require('express');
const fs = require('fs');
let idCounter = 0;
let cartIdCounter = 0;

class Product {
    constructor(title, description, price, code, stock, category, status = true, thumbnails = []) {
        this.id = ++idCounter;
        this.title = title;
        this.description = description;
        this.price = price;
        this.code = code;
        this.stock = stock;
        this.category = category;
        this.status = status;
        this.thumbnails = thumbnails;
    }
}

class Cart {
    constructor() {
        this.id = ++cartIdCounter;
        this.products = [];
    }

    addProduct(pid) {
        let product = this.products.find(p => p.product === pid);
        if (product) {
            product.quantity++;
        } else {
            this.products.push({ product: pid, quantity: 1 });
        }
    }
}

class Manager {
    constructor(path) {
        this.path = path;
        this.items = [];
    }

    addItem(item) {
        this.items.push(item);
        fs.writeFileSync(this.path, JSON.stringify(this.items));
    }

    getItems() {
        return JSON.parse(fs.readFileSync(this.path));
    }

    getItemById(id) {
        let items = this.getItems();
        let item = items.find(item => item.id === id);
        if (item) {
            return item;
        } else {
            console.log('Error: item no encontrado');
            return null;
        }
    }

    updateItem(id, field, value) {
        let items = this.getItems();
        let item = items.find(item => item.id === id);
        if (item) {
            item[field] = value;
            fs.writeFileSync(this.path, JSON.stringify(items));
        } else {
            console.log('Error: item no encontrado');
        }
    }

    deleteItem(id) {
        let items = this.getItems();
        let itemIndex = items.findIndex(item => item.id === id);
        if (itemIndex !== -1) {
            items.splice(itemIndex, 1);
            fs.writeFileSync(this.path, JSON.stringify(items));
        } else {
            console.log('Error: item no encontrado');
        }
    }
}

const app = express();
app.use(express.json());
const productManager = new Manager('./productos.json');
const cartManager = new Manager('./carrito.json');

app.get('/api/products', (req, res) => {
    let products = productManager.getItems();
    let limit = req.query.limit;
    if (limit) {
        products = products.slice(0, limit);
    }
    res.json({ products: products });
});

app.get('/api/products/:pid', (req, res) => {
    const product = productManager.getItemById(Number(req.params.pid));
    if (product) {
        res.json(product);
    } else {
        res.status(404).send('Producto no encontrado');
    }
});

app.post('/api/products', (req, res) => {
    const { title, description, price, code, stock, category, thumbnails } = req.body;
    const product = new Product(title, description, price, code, stock, category, true, thumbnails);
    productManager.addItem(product);
    res.json(product);
});

app.put('/api/products/:pid', (req, res) => {
    const { field, value } = req.body;
    productManager.updateItem(Number(req.params.pid), field, value);
    res.send('Producto actualizado');
});

app.delete('/api/products/:pid', (req, res) => {
    productManager.deleteItem(Number(req.params.pid));
    res.send('Producto eliminado');
});

app.post('/api/carts', (req, res) => {
    const cart = new Cart();
    cartManager.addItem(cart);
    res.json(cart);
});

app.get('/api/carts/:cid', (req, res) => {
    const cart = cartManager.getItemById(Number(req.params.cid));
    if (cart) {
        res.json(cart);
    } else {
        res.status(404).send('Carrito no encontrado');
    }
});

app.post('/api/carts/:cid/product/:pid', (req, res) => {
    const cart = cartManager.getItemById(Number(req.params.cid));
    if (cart) {
        cart.addProduct(Number(req.params.pid));
        cartManager.updateItem(cart.id, 'products', cart.products);
        res.send('Producto agregado al carrito');
    } else {
        res.status(404).send('Carrito no encontrado');
    }
});

const port = 8080;
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});


