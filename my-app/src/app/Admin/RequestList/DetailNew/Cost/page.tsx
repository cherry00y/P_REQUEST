"use client";
import { useEffect, useRef, useState } from "react";
import NavbarAdmin from "@/components/NavbarAdmin";
import { apiFetch } from "@/information/api";
import Swal from 'sweetalert2';



interface Product{
    product_id: number;
    productname: string;
}

interface OrderItem {
    productname: string;
    price: number;
    quantity: number;
    totalPrice: number;
}

export default function Cost(){

    const [product, setProduct] = useState<Product[]>([]); // Keep product as an array
    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
    const [grandTotal, setGrandTotal] = useState<number>(0);

    const productSelectRef = useRef<HTMLSelectElement | null>(null);
    const priceInputRef = useRef<HTMLInputElement | null>(null);
    const quantityInputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        apiFetch('/Admin/product')
        .then(response => response.json())
        .then((products) => {
            setProduct(products); // Assuming the API returns an array of products
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
    }, []);

    const handleAddItem = () => {
        const selectedProductName = productSelectRef.current?.value || "";
        const price = parseFloat(priceInputRef.current?.value || "0");
        const quantity = parseInt(quantityInputRef.current?.value || "1");
    
        if(!selectedProductName || price <= 0 || quantity <= 0){
            return; // Stop if invalid data is provided
        }
    
        const totalPrice = price * quantity;
    
        setOrderItems((prevItems) => {
            const existingItemIndex = prevItems.findIndex(
                (item) => item.productname === selectedProductName
            );
    
            if(existingItemIndex !== -1) {
                const updatedItems = [...prevItems];
                const existingItem = updatedItems[existingItemIndex];
                existingItem.quantity += quantity;
                existingItem.totalPrice += totalPrice;
                return updatedItems;
            }
    
            return [
                ...prevItems, {
                    productname: selectedProductName,
                    price,
                    quantity,
                    totalPrice
                },
            ];
        });
    
        setGrandTotal((prevTotal) => prevTotal + totalPrice);
    
        // Reset fields after adding the item
        if (productSelectRef.current) productSelectRef.current.value = "";
        if (priceInputRef.current) priceInputRef.current.value = "";
        if (quantityInputRef.current) quantityInputRef.current.value = "";
    };

    const handleQuantityChange = (index: number, newQuantity: number) => {
        setOrderItems((prevItems) => {
            const updatedItems = [...prevItems];
            const item = updatedItems[index];
            const oldQuantity = item.quantity;
            item.quantity = newQuantity;
            item.totalPrice = item.price * newQuantity;
            const priceDifference = (newQuantity - oldQuantity) * item.price;
            setGrandTotal((prevTotal) => prevTotal + priceDifference);
            return updatedItems;
        });
    };
    
    const handleRemoveItem = (index: number) => {
        setOrderItems((prevItems) => {
            const updatedItems = prevItems.filter((_, i) => i !== index);
            const newGrandTotal = updatedItems.reduce(
                (acc, item) => acc + item.totalPrice,
                0
            );
            setGrandTotal(newGrandTotal);
            return updatedItems;
        });
    };

    
    const handleAccept = async () => {
        const queryParams = new URLSearchParams(window.location.search);
        const newrequest_id = queryParams.get('newrequest_id'); 
    
        if (!newrequest_id) {
            console.error('newrequest_id is null or undefined');
            Swal.fire("Error", "New Request ID is missing", "error");
            return;
        }
    
        
        const costData = {
            newrequest_id, 
            orderItems: orderItems.map(item => ({
                productname: item.productname, 
                price: item.price,
                quantity: item.quantity, 
            })),
        };
    
        try {
            const response = await apiFetch('/Admin/addcost', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(costData),
            });
    
            if (response.ok) {
                Swal.fire({
                    icon: 'success',
                    title: 'Cost data saved successfully',
                    confirmButtonText: 'OK',
                    timer: 2000,

                }).then(() => {
                    window.location.href = '/Admin/Information/Infomcompleted'
                })    
            } else {
                Swal.fire("Error", "Failed to save cost data", "error");
            }
        } catch (error) {
            console.error('Error submitting cost data:', error);
            Swal.fire("Error", "An error occurred", "error");
        }
    };
    
    
    

    return(
        <div className="flex flex-col min-h-screen">
            <NavbarAdmin/>
            <main className="p-4 bg-white flex flex-col flex-1">
                <h2 className="text-2xl font-bold ml-20 mt-3">Cost of New Request</h2>
                <form
                    className="flex items-center space-x-5 ml-20 mt-3"
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleAddItem();
                    }}
                >
                    {/* Equipment Selection */}
                    <div className="flex-shrink-0 w-56">
                        <label htmlFor="product" className="sr-only">Select Equipment</label>
                        <select
                            id="equipment"
                            ref={productSelectRef}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                            defaultValue=""
                        >
                            <option value="" disabled>Select Equipment</option>
                            {product.map((product) => (
                                <option key={product.product_id} value={product.productname}>
                                    {product.productname}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Price Input */}
                    <div className="flex-shrink-0">
                        <label htmlFor="price" className="sr-only">Price</label>
                        <input
                            type="text"
                            id="price"
                            ref={priceInputRef}
                            placeholder="Price"
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                        />
                    </div>

                    {/* Quantity Input */}
                    <div className="flex-shrink-0">
                        <label htmlFor="quantity" className="sr-only">Quantity</label>
                        <input
                            type="number"
                            id="quantity"
                            ref={quantityInputRef}
                            placeholder="Quantity"
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                            required
                        />
                    </div>

                    {/* Add Button */}
                    <div>
                        <button
                            type="submit"
                            className="bg-blue-500 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            Add
                        </button>
                    </div>
                </form>
    
                <div className="flex justify-center items-center w-screen">
                    <div className="container rounded shadow-lg p-5 mt-5 border">
                        <div className="relative overflow-x-auto">
                            <table className="w-full text-sm text-left rtl:text-right text-gray-500">
                                <thead className="text-sm text-gray-700 bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3">No.</th>
                                        <th className="px-6 py-3">Order</th>
                                        <th className="px-6 py-3">Price</th>
                                        <th className="px-6 py-3">Quantity</th>
                                        <th className="px-6 py-3">Total Price</th>
                                        <th className="px-6 py-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orderItems.map((item, index) => (
                                        <tr key={index}>
                                            <td className="px-6 py-3">{index + 1}</td>
                                            <td className="px-6 py-3">{item.productname}</td>
                                            <td className="px-6 py-3">{item.price.toFixed(2)}</td>
                                            <td className="px-6 py-3">
                                                <input
                                                    type="number"
                                                    value={item.quantity}
                                                    onChange={(e) => handleQuantityChange(index, parseInt(e.target.value))}
                                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                                />
                                            </td>
                                            <td className="px-6 py-3">{item.totalPrice.toFixed(2)}</td>
                                            <td className="px-6 py-3">
                                                <button
                                                    onClick={() => handleRemoveItem(index)}
                                                    className="bg-red-500 text-white text-sm px-4 py-2 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                                                >
                                                    Remove
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="flex flex-row justify-between items-center mt-5">
                    <div className="ml-20">
                        <span className="text-lg font-bold">Total Amount: </span>
                        <span className="text-lg">{grandTotal.toFixed(2)} บาท</span>
                    </div>
                    <button
                        onClick={handleAccept}
                        className="bg-green-500 text-white text-sm px-4 py-2 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 mr-20"
                    >
                        Confirm and Save
                    </button>
                </div>
            </main>
        </div>
    );
}
