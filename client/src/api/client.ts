const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

type RequestOptions = RequestInit & {
    token?: string;
}

export async function apiRequest<T>( path: string, options: RequestOptions = {}): Promise <T> {

    const  { token, ...fetchOptions } = options;

    const response = await fetch(`${API_BASE_URL}${path}`,{
        ...fetchOptions,
        headers:{
            "Content-Type": "application/json",
            ...(token ? {
                Authorization: `Bearer ${token}`
            }:{}),
            ...fetchOptions.headers,
        }
    });

    const data = await response.json();

    if(!response.ok){
        throw new Error(data.message || "Something went  wrong");
    }

    return data;

}