package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"os"
	"strings"

	ui "github.com/canonical/inference-snaps-ui"
)

func main() {
	openAIBaseURL := flag.String("openai-base-url", "http://localhost:8328/v1", "OpenAI-compatible base URL")
	capabilitiesFlag := flag.String("capabilities", strings.Join(ui.SupportedUICapabilities(), ","), "Comma-separated UI capabilities")
	instanceName := flag.String("instance-name", "example", "Instance name shown in the UI")
	engineName := flag.String("engine-name", "intel-cpu", "Engine name shown in the UI")
	serverPort := flag.Int("port", 8080, "Port to serve the UI on")
	staticDir := flag.String("static-dir", "./static", "UI static files directory")

	flag.Parse()

	capabilities := strings.Split(*capabilitiesFlag, ",")

	config := ui.Config{
		OpenAIBaseURL: *openAIBaseURL,
		Capabilities:  capabilities,
		InstanceName:  *instanceName,
		EngineName:    *engineName,
	}

	b, _ := json.MarshalIndent(config, "", "  ")
	fmt.Printf("Starting server with config:\n%s\n", b)

	if err := ui.Serve(config, *staticDir, *serverPort, "localhost"); err != nil {
		fmt.Printf("Failed to start server: %v\n", err)
		os.Exit(1)
	}
}
