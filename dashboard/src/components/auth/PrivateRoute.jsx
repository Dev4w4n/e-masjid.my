import PropTypes from 'prop-types'
import { useKeycloak } from '@react-keycloak/web'

function PrivateRoute({ children }) {
  const { keycloak } = useKeycloak()

  const Login = async () => {
    await keycloak.login()
  }

  return keycloak.authenticated ? <>{children}</> : <Login />
}

PrivateRoute.propTypes = {
  children: PropTypes.node, // Validate the 'children' prop
}

export default PrivateRoute
