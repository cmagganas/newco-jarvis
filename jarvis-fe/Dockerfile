# Use an official Node runtime as a parent image
FROM node:latest

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if available) into the container
COPY package*.json ./

# Install any dependencies
RUN npm install

# Copy the current directory contents into the container at /usr/src/app
COPY . .

# Make port available to the world outside this container
EXPOSE 9000 

# Define the command to run your app
CMD ["node", "server.js"]

