# App Vision

DormDeals is a web application that is a marketplace for students to find and sell furniture. The main page should show a grid of available furniture with information about each listing visible, such as price and neighborhood. There should be a search bar at the top, as well as a plus button in the top right to add your own listing. You should be able to make your own post and fill out information such as price, condition, pickup/delivery.

Architecture:
Main Components
React + typescript front end
Firebase hosted backend

Data Structures:
Users
Username
Password
Contact information
Listing
Userid
Image
Title
Description
furnitureType
Price
Condition
location
deliveryMethod
listDate (to show posted 3 days ago etc…)

JSON example for firebase:

Authentication:
Google email sign in using firebase, must end in u.northwestern.edu

Front-End display needs

Marketplace.tsx (Landing page)
Grid of Listings
Search bar
Filter and search functionality in react front end, should search for keywords,
Filter box
Filter by furniture type
Filter by price range
Filter by condition
Listing includes:
Image
Price
Location
Condition
Post
Should have spaces for:
Image
Price
Neighborhood
Condition
User Flows:
Finding a piece of furniture and messaging seller:
Loads marketplace page → firebase call to getListings
User scrolls down page
Uses search bar to narrow down furniture descriptions
Searches through title, description, condition, location
Uses filters to narrow down features
Price range: have boxes for under $20, $20-40, $50 or a slider
Condition: like new, new, fair, damaged
Furniture type: searchable dropdown, can check boxes for certain furniture types
Click on more filters → popup opens in the center of the page with filter types. Can select a filter to see all of the options available.
Click on a listing → listing expands in a popup with all available information
See expanded information (description, and contact info)
Click message seller → button reveals seller contact information
Click on logo → resets all filters, search query, and sort settings to return to default marketplace page

Listing an item:
Click list an item
Fill out listing
Drop in image
Type title, description, location
Select furniture: searchable window where you can select from a list of furniture
Enter price
Choose pickup method from dropdown
Click to save listing → listing is saved to backend → calls the POST listing api
Should update the front end to display the added listing (re call the listing api and show the new listing)
Or click cancel: closes the window, nothing is saved
The user is redirected to the marketplace page, shown a success notification in the middle of the page, reload the page so the listing shows up.

TYPES.ts
interface Listing {
id: string;
title: string;
description: string;
price: number;
image: string;
furnitureType: string;
condition: string;
location: string;
deliveryMethod: string;
listDate;
}
