import axios from "axios";

export const api = axios.create({
  baseURL: 'http://185.209.229.138:8989/api/v1/'
});