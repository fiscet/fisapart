export function Footer() {
  return (
    <footer className="bg-card border-border border-t py-12" data-testid="footer">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="mb-4 flex items-center">
              <i className="fas fa-home text-primary mr-2 text-2xl"></i>
              <h4 className="text-foreground text-xl font-bold">FisApart</h4>
            </div>
            <p className="text-muted-foreground mb-4">
              The best vacation apartments in Italy. Discover Italian culture and enjoy authentic
              experiences.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <i className="fab fa-facebook text-xl"></i>
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <i className="fab fa-instagram text-xl"></i>
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <i className="fab fa-twitter text-xl"></i>
              </a>
            </div>
          </div>
          <div>
            <h5 className="mb-4 font-semibold">Useful links</h5>
            <ul className="text-muted-foreground space-y-2">
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Terms & Conditions
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Cancellation Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Help
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h5 className="mb-4 font-semibold">Contact</h5>
            <ul className="text-muted-foreground space-y-2">
              <li className="flex items-center space-x-2">
                <i className="fas fa-envelope text-sm"></i>
                <span>info@fisapart.com</span>
              </li>
              <li className="flex items-center space-x-2">
                <i className="fas fa-phone text-sm"></i>
                <span>+39 1 234 5678</span>
              </li>
              <li className="flex items-center space-x-2">
                <i className="fas fa-map-marker-alt text-sm"></i>
                <span>Rome, Italy</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-border text-muted-foreground mt-8 border-t pt-8 text-center">
          <p>&copy; 2026 FisApart. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
