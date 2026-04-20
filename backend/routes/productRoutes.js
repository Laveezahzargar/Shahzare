const express = require("express");
const { protect, admin } = require("../middleware/authMiddleware");
const Product = require("../models/Product");

const router = express.Router();

//ROUTE = -POST (/api/products)
//description = create aa new product in DB
//ACCESS = Private/Admin
router.post("/", protect, admin, async (req, res) => {
    try {
        const {
            name,
            description,
            price,
            discountPrice,
            countInStock,
            category,
            brand,
            sizes,
            colors,
            collections,
            material,
            gender,
            images,
            isFeatured,
            isPublished,
            tags,
            dimensions,
            weight,
            sku,
        } = req.body;

        const product = new Product({
            name,
            description,
            price,
            discountPrice,
            countInStock,
            category,
            brand,
            sizes,
            colors,
            collections,
            material,
            gender,
            images,
            isFeatured,
            isPublished,
            tags,
            dimensions,
            weight,
            sku,
            user: req.user._id,//Id of Admin creating product
        });
        const createdProduct = await product.save();
        res.status(201).json(createdProduct);
    } catch (error) {
        console.log(error);
        res.status(500).send("Server Error");
    }
});

//ROUTE = -PUT (/api/products/:id)
//description = update an existing product in DB
//ACCESS = Private/Admin

router.put("/:id", protect, admin, async (req, res) => {
    try {
        const {
            name,
            description,
            price,
            discountPrice,
            countInStock,
            category,
            brand,
            sizes,
            colors,
            collections,
            material,
            gender,
            images,
            isFeatured,
            isPublished,
            tags,
            dimensions,
            weight,
            sku,
        } = req.body;

        //find the product in DB using Id
        const product = await Product.findById(req.params.id);

        if (product) {
            //update product fiellds
            product.name = name || product.name;
            product.description = description || product.description;
            product.price = price || product.price;
            product.discountPrice = discountPrice || product.discountPrice;
            product.countInStock = countInStock || product.countInStock;
            product.category = category || product.category;
            product.brand = brand || product.brand;
            product.sizes = sizes || product.sizes;
            product.colors = colors || product.colors;
            product.collections = collections || product.collections;
            product.material = material || product.material;
            product.gender = gender || product.gender;
            product.images = images || product.images;
            product.isFeatured =
                isFeatured !== undefined ? isFeatured : product.isFeatured;
            product.isPublished =
                isPublished !== undefined ? isPublished : product.isPublished;
            product.tags = tags || product.tags;
            product.dimensions = dimensions || product.dimensions;
            product.weight = weight || product.weight;
            product.sku = sku || product.sku;

            //save the updated product to DB
            const updatedProduct = await product.save();
            res.json(updatedProduct);
        } else {
            res.status(404).json({ message: "Product not found!" });
        }

    } catch (error) {
        console.log(error);
        res.status(500).send("Server Error");
    }
});


//ROUTE = -DELETE (/api/products/:id)
//description = delete an existing product in DB by ID
//ACCESS = Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        //find product from DB
        const product = await Product.findById(req.params.id);
        if (product) {
            //remove the product from DB
            await product.deleteOne();
            res.json({ message: "Product removed" });
        } else {
            res.status(404).json({ message: "Product not found" })
        }
    } catch (error) {
        console.log(error);
        res.status(500).send("Server Error");
    }
});

//ROUTE = -GET (/api/products)
//description = get all products with optional query filters
//ACCESS = Public

router.get("/", async (req, res) => {
    try {
        const {
            collections,
            sizes,
            colors,
            gender,
            minPrice,
            maxPrice,
            sortBy,
            search,
            category,
            material,
            brand,
            limit
        } = req.query;

        let query = {};

        //filter logic
        if (collections && collections.toLocaleLowerCase() !== "all") {
            query.collections = collections;
        }
        if (category && category.toLocaleLowerCase() !== "all") {
            query.category = category;
        }
        if (material) {
            query.material = { $in: material.split(",") };
        }
        if (brand) {
            query.brand = { $in: brand.split(",") };
        }
        if (sizes) {
            query.sizes = { $in: sizes.split(",") };
        }
        if (colors) {
            query.colors = { $in: [colors] };
        }
        if (gender) {
            query.gender = gender;
        }
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.gte = Number(minPrice);
            if (maxPrice) query.price.lte = Number(maxPrice);
        }
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } }
            ];
        }

        //sort logic
        let sort = {};
        if (sortBy) {
            switch (sortBy) {
                case "priceAsc":
                    sort = { price: 1 };
                    break;
                case "priceDesc":
                    sort = { price: -1 };
                    break;
                case "popularity":
                    sort = { rating: -1 };
                    break;
                default:
                    break;
            }
        };

        //fetch products and apply sorting and limit

        let products = await Product.find(query)
            .sort(sort)
            .limit(Number(limit) || 0);
        res.json(products);

    } catch (error) {
        console.log(error);
        res.status(500).send("Server Error");
    }
});

//ROUTE = -GET (/api/products/similar/:id)
//description = Retreive similar products based on current product's gender and category
//ACCESS = Public

router.get("/similar/:id", async (req, res) => {
    const { id } = req.params
    try {
        const products = await Product.findById(id)

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        const similarProducts = await Product.find({
            _id: { $ne: id },
            gender: product.gender,
            category: product.category
        }).limit(4);

        res.json(similarProducts)

    } catch (error) {
         console.log(error);
         return res.status(500).json({message:"Server error"});
    }
})

//ROUTE = -GET (/api/products/:id)
//description = get a single product by its id
//ACCESS = Public

router.get("/:id", async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            res.json(product);
        }
        else {
            res.status(404).json({ message: "Product not found!" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).send("Server Error");
    }
})





module.exports = router;