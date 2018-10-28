package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"path/filepath"
	"strings"

	"gopkg.in/yaml.v2"
)

type SkillArea struct {
	Title       string `json:"title"`
	Description string `json:"description"`
	SkillLevels []struct {
		Level  string   `json:"level"`
		Skills []string `json:"skills"`
	} `yaml:"skill_levels" json:"skill_levels"`
}

func main() {
	var yamlInDir string
	var jsOutFile string
	flag.StringVar(&yamlInDir, "input", "", "directory containing YAML files to read")
	flag.StringVar(&jsOutFile, "output", "", "path to JavaScript file to create/overwrite with generated config")
	flag.Parse()

	if yamlInDir == "" {
		log.Fatalf("missing required flag 'input'")
	}
	if jsOutFile == "" {
		log.Fatalf("missing required flag 'output'")
	}

	skillAreas, err := readSkillAreasFromDirectory(yamlInDir)
	if err != nil {
		log.Fatalf("reading inputs: %s", err)
	}

	if len(skillAreas) < 1 {
		log.Fatalf("no YAML files found in input directory")
	}

	err = writeJavascriptFile(jsOutFile, skillAreas)
	if err != nil {
		log.Fatalf("writing output: %s", err)
	}
}

func writeJavascriptFile(jsOutFile string, data interface{}) error {
	outFile, err := os.Create(jsOutFile)
	if err != nil {
		return err
	}
	_, err = outFile.WriteString("var config_skillAreas = ")
	if err != nil {
		return err
	}
	jsonEncoder := json.NewEncoder(outFile)
	jsonEncoder.SetIndent("", "  ")
	err = jsonEncoder.Encode(data)
	if err != nil {
		log.Fatalf("marshal output: %s", err)
	}
	_, err = outFile.WriteString("\n")
	if err != nil {
		return err
	}
	return outFile.Close()
}

func isYAMLFile(filename string) bool {
	return strings.HasSuffix(filename, ".yaml") || strings.HasSuffix(filename, ".yml")
}

func readSkillAreasFromDirectory(yamlInDir string) ([]*SkillArea, error) {
	filesInDir, err := ioutil.ReadDir(yamlInDir)
	if err != nil {
		return nil, fmt.Errorf("reading input directory: %s", err)
	}

	var skillAreas []*SkillArea
	for _, fileInfo := range filesInDir {
		path := filepath.Join(yamlInDir, fileInfo.Name())
		if fileInfo.IsDir() || !isYAMLFile(path) {
			continue
		}
		skillArea, err := unmarshalYAMLFile(path)
		if err != nil {
			return nil, fmt.Errorf("for file %s: %s", path, err)
		}

		skillAreas = append(skillAreas, skillArea)
	}

	return skillAreas, nil
}

func unmarshalYAMLFile(filename string) (*SkillArea, error) {
	file, err := os.Open(filename)
	if err != nil {
		return nil, fmt.Errorf("reading skill area file: %s", err)
	}

	var skillArea SkillArea
	decoder := yaml.NewDecoder(file)
	decoder.SetStrict(true)
	err = decoder.Decode(&skillArea)
	if err != nil {
		return nil, fmt.Errorf("unmarshaling yaml: %s", err)
	}

	return &skillArea, nil
}
