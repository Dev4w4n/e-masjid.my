# Minikube Setup

This documentation outlines the steps for setting up Minikube and forwarding multiple services for your Kubernetes cluster to local ports.

## Requirements

- **Minikube**: A tool for running Kubernetes clusters locally.
- **kubectl**: Command line tool for interacting with Kubernetes clusters.

## Step 1: Start Minikube - ```minikube start```

## Step 2: Add database mount path
    
        minikube ssh
        sudo mkdir -p /mnt/disks/minikube-data
        sudo chmod 777 /mnt/disks/minikube-data
        exit
    
## Step 3: Apply yaml file - ```k apply -f <filename>```

    k apply -f postgres-storage.yaml
    k apply -f postgres-pv.yaml
    k apply -f postgres-stateful.yaml
    k apply -f postgres-service.yaml

    k apply -f cadangan-api-deployment.yaml
    k apply -f cadangan-api-service.yaml
    
    k apply -f cadangan-public-api-deployment.yaml
    k apply -f cadangan-public-api-service.yaml
    
    k apply -f dashboard-deployment.yaml
    k apply -f dashboard-service.yaml
    
    k apply -f khairat-api-deployment.yaml
    k apply -f khairat-api-service.yaml
    
    k apply -f public-web-deployment.yaml
    k apply -f public-web-service.yaml
    
    k apply -f saas-api-deployment.yaml
    k apply -f saas-api-service.yaml
            
    k apply -f tabung-api-deployment.yaml
    k apply -f tabung-api-service.yaml
    
    k apply -f tetapan-api-deployment.yaml
    k apply -f tetapan-api-service.yaml
    
    k apply -f tetapan-public-api-deployment.yaml
    k apply -f tetapan-public-api-service.yaml 
    

## Step 3: Forward Services to Local Ports

    kubectl port-forward svc/cadangan-api 8083:8083 &
    kubectl port-forward svc/cadangan-public-api 8084:8084 &
    kubectl port-forward svc/dashboard 3000:3000 &
    kubectl port-forward svc/khairat-api 8081:8081 &
    kubectl port-forward svc/public-web-service 3001:3001 &
    kubectl port-forward svc/saas-api 8080:8080 &
    kubectl port-forward svc/tabung-api 8082:8082 &
    kubectl port-forward svc/tetapan-api 8085:8085 &
    kubectl port-forward svc/tetapan-public-api 8086:8086 &

## Step 3: Step 5: Access Services Locally
- [Public Web](http://localhost:3001)
- [Dashboard](http://localhost:3000)
- [Cadangan API](http://localhost:8083)
- [Cadangan Public API](http://localhost:8084)
- [Khairat API](http://localhost:8081)
- [SaaS API](http://localhost:8080)
- [Tabung API](http://localhost:8082)
- [Tetapan API](http://localhost:8085)
- [Tetapan Public API](http://localhost:8086)