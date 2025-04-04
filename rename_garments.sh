#!/bin/bash

# Male shirts
cd public/garments/male/shirts
files=(*)
mv "${files[0]}" blue-formal.jpg
mv "${files[1]}" white-casual.jpg
mv "${files[2]}" black-dress.jpg

# Male tshirts
cd ../../male/tshirts
files=(*)
mv "${files[0]}" red-graphic.jpg
mv "${files[1]}" navy-basic.jpg
mv "${files[2]}" striped.jpg

# Male pants
cd ../../male/pants
files=(*)
mv "${files[0]}" khaki-chinos.jpg
mv "${files[1]}" blue-jeans.jpg
mv "${files[2]}" black-dress.jpg

# Male coats
cd ../../male/coats
files=(*)
mv "${files[0]}" winter-coat.jpg
mv "${files[1]}" leather-jacket.jpg
mv "${files[2]}" blazer.jpg

# Male kurtas
cd ../../male/kurtas
files=(*)
mv "${files[0]}" embroidered.jpg
mv "${files[1]}" white.jpg
mv "${files[2]}" wedding.jpg

# Female shirts
cd ../../female/shirts
files=(*)
mv "${files[0]}" white-blouse.jpg
mv "${files[1]}" floral.jpg
mv "${files[2]}" silk.jpg

# Female tshirts
cd ../../female/tshirts
files=(*)
mv "${files[0]}" pink-graphic.jpg
mv "${files[1]}" white-basic.jpg
mv "${files[2]}" crop-top.jpg

# Female pants
cd ../../female/pants
files=(*)
mv "${files[0]}" black-leggings.jpg
mv "${files[1]}" skinny-jeans.jpg
mv "${files[2]}" wide-leg.jpg

# Female dresses
cd ../../female/dresses
files=(*)
mv "${files[0]}" summer.jpg
mv "${files[1]}" cocktail.jpg
mv "${files[2]}" maxi.jpg

# Female skirts
cd ../../female/skirts
files=(*)
mv "${files[0]}" a-line.jpg
mv "${files[1]}" pencil.jpg
mv "${files[2]}" pleated.jpg

echo "All files renamed successfully!" 