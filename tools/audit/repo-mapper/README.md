# Repo Mapper

The repo mapper does .. (TODO)

## Architecture

The repo mapper is a 2 container pod. 

### Ansible Container

The ansible container has all the credentials and logic to perform the audit and create a `csv` file. 

The `csv` is written to a volume in the Caddy Container

### Caddy Container

The caddy container serves a simple website that provides a download link to the csv. 

The website is built from a basic React Boilerplate. You wll find that the React App and Caddy are chain built together. 

