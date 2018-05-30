/**
 * Check whether the user who does the request is authenticated.
 * @param req - a request.
 * @param res - a response.
 * @param next - next.
 */
const authorizeCheck = (req: any, res: any, next: any) => {
  if (req.isAuthenticated()) {
      next();
  }  else {
      res.sendStatus(401);
  }
};

export default authorizeCheck;