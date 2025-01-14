
# Helm Chart Setup for Minikube 


1. Set DB Node: Ensure the correct .Values.global.dbNode is selected (default: 'minikube').
2. make sure postgres mount path created and exist on node.
    ```
        sudo mkdir -p /mnt/disks/postgres; sudo chmod 777 /mnt/disks/postgres
        
    ```
3. enable ingress
    ```
        minikube addons enable ingress;minikube addons enable ingress-dns
    
    ```
    
4. `helm install <chartname> . `

5. open https://tenant.e-masjid.my/



## Issue

 - need to rebuild dashboard image with `process.env.REACT_APP_ENV === 'development'` to bypass keycloak and access dashboard web
 
 - POST https://tenant.emasjid-my/secure/tetapan/senarai
 - POST https://tenant.emasjid-my/secure/cadangan?page=1&size=25&cadanganTypeId=1&isOpen=true
 
