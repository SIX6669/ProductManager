let idCounter = 0;
const fs = require('fs');
const express = require('express');

class Product {
    constructor(title, description, price, thumbnail, code, stock){
        this.id = ++ idCounter;
        this.title = title;
        this.description = description;
        this.price = price;
        this.thumbnail = thumbnail;
        this.code = code;
        this.stock = stock;
    }
}

class ProductManager{
    constructor(path){
        this.path = path;
        this.products = []
    }

    addProduct(product){
        product.id = ++idCounter;
        this.products.push(product);
        fs.writeFileSync(this.path, JSON.stringify(this.products));
    }

    getProducts(){
        return JSON.parse(fs.readFileSync(this.path));
    }

    getProductById(id){
        let products = this.getProducts();
        let product = products.find(product => product.id === id);
        if (product){
            return product;
        }else{
            console.log('Error: producto no encontrado');
            return null;
        }
    }

    updateProduct(id, field, value){
        let products = this.getProducts();
        let product = products.find(product => product.id === id);
        if (product){
            product[field] = value;
            fs.writeFileSync(this.path, JSON.stringify(products));
        }else{
            console.log('Error: producto no encontrado');
        }
    }

    deleteProduct(id){
        let products = this.getProducts();
        let productIndex = products.findIndex(product => product.id === id);
        if (productIndex !== -1){
            products.splice(productIndex, 1);
            fs.writeFileSync(this.path, JSON.stringify(products));
        }else{
            console.log('Error: producto no encontrado');
        }
    }
}

const app = express();
const myProductManager = new ProductManager('./products.json');

app.get('/products', (req, res) => {
    let products = myProductManager.getProducts();
    let limit = req.query.limit;
    if (limit) {
        products = products.slice(0, limit);
    }
    res.json({products: products});
});

app.get('/products/:pid', (req, res) => {
    const product = myProductManager.getProductById(req.params.pid);
    if (product) {
        res.json(product);
    } else {
        res.status(404).send('Producto no encontrado');
    }
});

const port = 3000;
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});

myProductManager.addProduct({title: 'Spaghetti', description: 'spaghettis finos de alta calidad', price: 1500, thumbnail: './creole-spaghetti.jpg', code: 0, stock: 23});
myProductManager.addProduct({title: 'Canelones rellenos', description: 'canelones rellenos con carne o espinaca', price: 2000, thumbnail: './canelones.jpg', code: 1, stock: 21});
myProductManager.addProduct({title: 'Sorrentinos', description: 'Deliciosos sorrentinos rellenos de carne, ricota o jamos y queso', price: 2100, thumbnail: './sorrentinos-rellenos-de-jamon-y-queso-con-salsa-marinanara', code: 2, stock: 22});

console.log(myProductManager.getProductById(1));
console.log(myProductManager.getProductById(2));
console.log(myProductManager.getProductById(3));