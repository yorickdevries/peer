import izitoast from "izitoast"

const succesInterceptor = function(response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    if (process.env.NODE_ENV !== "production") {
        console.log(response.data)
    }
    return response
}

const errorInterceptor = function(error) {
    if (error.config.bypass) {
        return Promise.reject(error)
    }
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    izitoast.error({
        title: "Error",
        message: JSON.stringify(error.response.data),
        position: "bottomCenter"
    })
    return Promise.reject(error)
}

export { succesInterceptor, errorInterceptor }
