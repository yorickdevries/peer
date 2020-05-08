if (!process.env.NODE_ENV || process.env.NODE_ENV in ['development', 'test']){
    process.env.NODE_ENV = 'test';
}
else {
    throw new Error(`NODE_ENV is set to ${process.env.NODE_ENV}`);
}
