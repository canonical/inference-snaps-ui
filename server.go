package ui

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
)

func Serve(conf Config, staticDir string, port int, bindAddress string) error {

	if _, err := os.Stat(filepath.Join(staticDir, "index.html")); errors.Is(err, os.ErrNotExist) {
		return fmt.Errorf("ensure index.html: %s", err)
	}

	mux := http.NewServeMux()

	// Serve configuration for the frontend
	mux.HandleFunc("/config", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Cache-Control", "no-store")
		if err := json.NewEncoder(w).Encode(conf); err != nil {
			http.Error(w, "encode config", http.StatusInternalServerError)
		}
	})

	// Serve the frontend static files
	mux.Handle("/", http.FileServer(http.Dir(staticDir)))

	fmt.Printf("Serving %q on http://localhost:%d\n", staticDir, port)

	return http.ListenAndServe(fmt.Sprintf("%s:%d", bindAddress, port), mux)
}
