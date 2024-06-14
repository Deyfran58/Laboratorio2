import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Productos } from "../entity/Productos";

class ProductosController {

    static getAll = async (req: Request, res: Response) => {
        try {
            const repo = AppDataSource.getRepository(Productos);
            const listaProductos = await repo.find({ where: { estado: true } });

            if (listaProductos.length === 0) {
                return res.status(404).json({ message: "No hay productos registrados." });
            }

            return res.status(200).json(listaProductos);
        } catch (error) {
            return res.status(500).json({ message: "Error al acceder a la base de datos.", error });
        }
    }

    static create = async (req: Request, res: Response) => {
        const repoProducto = AppDataSource.getRepository(Productos);

        try {
            const { id, nombre, precio, stock, categoria } = req.body;

            if (!id || !nombre || !precio || !stock || !categoria) {
                return res.status(400).json({ message: "Todos los campos son obligatorios." });
            }

            let producto = await repoProducto.findOne({ where: { id } });
            if (producto) {
                return res.status(400).json({ message: "Ese producto ya existe en la base de datos." });
            }

            if (stock <= 0) {
                return res.status(400).json({ message: "El stock debe ser mayor a 0." });
            }

            producto = new Productos();
            producto.id = id;
            producto.nombre = nombre;
            producto.precio = precio;
            producto.categoria = categoria;
            producto.stock = stock;
            producto.estado = true;

            await repoProducto.save(producto);

            return res.status(201).json({ message: "Producto creado correctamente.", producto });
        } catch (error) {
            return res.status(500).json({ message: "Error al guardar el producto.", error });
        }
    }

    static getOne = async (req: Request, res: Response) => {
        try {
            const id = parseInt(req.params['id']);

            if (!id) {
                return res.status(400).json({ message: "Debe indicar el ID del producto." });
            }

            const repo = AppDataSource.getRepository(Productos);

            try {
                const producto = await repo.findOneOrFail({ where: { id } });
                return res.status(200).json(producto);
            } catch (error) {
                return res.status(404).json({ message: "El producto con el ID indicado no existe en la base de datos." });
            }
        } catch (error) {
            return res.status(500).json({ message: "Error al obtener el producto.", error });
        }
    }

    static update = async (req: Request, res: Response) => {
        const id = parseInt(req.params['id']);
        const { nombre, precio, stock, categoria } = req.body;

        try {
            const repoProducto = AppDataSource.getRepository(Productos);
            let producto = await repoProducto.findOne({ where: { id } });

            if (!producto) {
                return res.status(404).json({ message: "Producto no encontrado." });
            }

            producto.nombre = nombre || producto.nombre;
            producto.precio = precio || producto.precio;
            producto.stock = stock || producto.stock;
            producto.categoria = categoria || producto.categoria;

            await repoProducto.save(producto);

            return res.status(200).json({ message: "Producto actualizado correctamente.", producto });
        } catch (error) {
            return res.status(500).json({ message: "Error al actualizar el producto.", error });
        }
    }

    static delete = async (req: Request, res: Response) => {
        const id = parseInt(req.params['id']);

        try {
            const repoProducto = AppDataSource.getRepository(Productos);
            let producto = await repoProducto.findOne({ where: { id } });

            if (!producto) {
                return res.status(404).json({ message: "Producto no encontrado." });
            }

            await repoProducto.delete(id);

            return res.status(200).json({ message: "Producto eliminado correctamente." });
        } catch (error) {
            return res.status(500).json({ message: "Error al eliminar el producto.", error });
        }
    }
}

export default ProductosController;
