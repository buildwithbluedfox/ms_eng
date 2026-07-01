import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const newProduct = await request.json();
    
    // Validate required fields
    if (!newProduct.title || !newProduct.category || !newProduct.image || !newProduct.description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const dataFilePath = path.join(process.cwd(), 'public', 'data', 'catalog.json');
    
    // Read existing catalog
    let currentCatalog = [];
    if (fs.existsSync(dataFilePath)) {
      const fileData = fs.readFileSync(dataFilePath, 'utf-8');
      try {
        currentCatalog = JSON.parse(fileData);
      } catch (e) {
        currentCatalog = [];
      }
    }

    // Generate a unique ID (simple increment for now, or just Date.now())
    const maxId = currentCatalog.reduce((max, p) => {
      const idNum = parseInt(p.id, 10);
      return !isNaN(idNum) && idNum > max ? idNum : max;
    }, 0);
    newProduct.id = (maxId + 1).toString();

    // Append the new product
    currentCatalog.push(newProduct);

    // Write it back to the file
    fs.writeFileSync(dataFilePath, JSON.stringify(currentCatalog, null, 2));

    return NextResponse.json({ success: true, product: newProduct });
  } catch (error) {
    console.error('Error adding product:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    
    if (!id) {
      return NextResponse.json({ error: 'Missing product ID' }, { status: 400 });
    }

    const dataFilePath = path.join(process.cwd(), 'public', 'data', 'catalog.json');
    
    if (!fs.existsSync(dataFilePath)) {
      return NextResponse.json({ error: 'Catalog not found' }, { status: 404 });
    }

    const fileData = fs.readFileSync(dataFilePath, 'utf-8');
    let currentCatalog = JSON.parse(fileData);

    const initialLength = currentCatalog.length;
    currentCatalog = currentCatalog.filter((p: any) => p.id !== id);

    if (currentCatalog.length === initialLength) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Write updated catalog back to the file
    fs.writeFileSync(dataFilePath, JSON.stringify(currentCatalog, null, 2));

    return NextResponse.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
