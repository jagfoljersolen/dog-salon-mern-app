import { useState } from "react"
import axios from "axios"
import { Link } from "react-router-dom"
import styles from "./styles.module.css"


const Login = () => {
    const [data, setData] = useState({ email: "", password: "" })
    const [error, setError] = useState("")
    const handleChange = ({ currentTarget: input }) => {
        setData({ ...data, [input.name]: input.value })
    };

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const url = "http://localhost:8080/api/auth"
            const { data: res } = await axios.post(url, data)
            localStorage.setItem("token", res.data)
            window.location = "/"
        } catch (error) {
            if (
                error.response &&
                error.response.status >= 400 &&
                error.response.status <= 500
            ) {
                setError(error.response.data.message)
            }
        }
    }
    return (
        <div className={styles.login_container}>
            <div className={styles.card}>
                <form className={styles.form_container} onSubmit={handleSubmit}>
                    
                    <h1>Zaloguj się na swoje konto <span role="img" aria-label="paws">🐾</span></h1>
                    <input
                        type="email"
                        placeholder="Email"
                        name="email"
                        onChange={handleChange}
                        value={data.email}
                        required
                        className={styles.input}
                    />
                    <input
                        type="password"
                        placeholder="Hasło"
                        name="password"
                        onChange={handleChange}
                        value={data.password}
                        required
                        className={styles.input}
                    />
                    {error && <div className={styles.error_msg}>{error}</div>}
                    <button type="submit" className={styles.green_btn}>
                        Zaloguj 
                    </button>
                    
                </form>
                <div className={styles.signup_prompt}>
                    <span>Nie masz jeszcze konta?</span>
                    <Link to="/signup">
                        <button type="button" className={styles.white_btn}>
                            Zarejestruj się
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    )
}
export default Login
