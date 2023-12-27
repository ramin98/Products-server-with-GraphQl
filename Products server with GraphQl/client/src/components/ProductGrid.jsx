import React, { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchProducts } from "../store/reducer";

const cleanBodyHtml = (bodyHtml) => {
  const imageRegex = /https?:\/\/\S+\.(jpg|jpeg|png|gif|svg)/gi;
  return bodyHtml.replace(imageRegex, "");
};

const ProductList = () => {
  const dispatch = useDispatch();
  const products = useSelector((state) => state.products.items);
  console.log(products);
  const productStatus = useSelector((state) => state.products.status);
  const error = useSelector((state) => state.products.error);

  useEffect(() => {
    if (productStatus === "idle") {
      dispatch(fetchProducts());
    }
  }, [productStatus, dispatch]);

  return (
    <main>
      {productStatus === "loading" && <h1>Loading...</h1>}
      {productStatus === "failed" && <h1>Error: {error}</h1>}
      <ul className="product-grid">
        {productStatus === "succeeded" &&
          products.map((product) => (
            <li className="product-card" key={product.id}>
              <ProductImage src={product.imagesrc} />
              <div
                dangerouslySetInnerHTML={{
                  __html: cleanBodyHtml(product.bodyhtml),
                }}
              ></div>
            </li>
          ))}
      </ul>
    </main>
  );
};

export default ProductList;

const ProductImage = ({ src }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const image = new Image();
    image.src = src;
    image.onload = () => {
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
    };
  }, [src]);

  return <canvas ref={canvasRef} width="200" height="200"></canvas>;
};
