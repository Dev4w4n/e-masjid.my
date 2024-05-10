
Create using JSON
```
curl -H "Accept: application/json" -H "Content-type: application/json" -X POST -d '{"name":"newTenant","separateDb":true}' http://localhost:8090/tenant
```


Create using CLI
```
masjid add -1 mjsr-auth -2 http://mjsr.login.com -3 http://keycloak.com -4 mjsr_manager -5 mjsr -6 MJSR -7 mjsr_user

add called with namespace: MJSR
add called with name: mjsr
add called with keycloak-client-id: mjsr-auth
add called with keycloak-jwks-url: http://mjsr.login.com
add called with keycloak-server: http://keycloak.com
add called with manager-role: mjsr_manager
add called with user-role: mjsr_user
```

add -1 matmm-auth -2 http://matmm.login.com -3 http://keycloak.com -4 matmm_manager -5 matmm -6 MATMM -7 matmm_user