import { useEffect, useRef } from "react";
import Phaser from "phaser";

class MainScene extends Phaser.Scene {
  constructor() {
    super("MainScene");
  }

  create() {
    // -------------------------
    // Background
    // -------------------------

    this.add.rectangle(
      400,
      300,
      800,
      600,
      0x2b2b2b
    );

    // -------------------------
    // Title
    // -------------------------

    this.add.text(
      250,
      40,
      "THE RED LANTERN DINER",
      {
        fontSize: "32px",
        color: "#ffffff",
      }
    );

    // -------------------------
    // Player
    // -------------------------

    this.player = this.add.rectangle(
      400,
      350,
      50,
      70,
      0x4caf50
    );

    // -------------------------
    // Keyboard
    // -------------------------

    this.cursors =
      this.input.keyboard.createCursorKeys();

    this.keys = this.input.keyboard.addKeys({
      W: Phaser.Input.Keyboard.KeyCodes.W,
      A: Phaser.Input.Keyboard.KeyCodes.A,
      S: Phaser.Input.Keyboard.KeyCodes.S,
      D: Phaser.Input.Keyboard.KeyCodes.D,
    });

    // -------------------------
    // Interaction key
    // -------------------------

    this.interactKey =
      this.input.keyboard.addKey(
        Phaser.Input.Keyboard.KeyCodes.E
      );

    // -------------------------
    // Game state
    // -------------------------

    this.dialogueOpen = false;

    this.sqlComputerOpen = false;

    this.caseSteps = [];

    this.npcs = [];

    this.currentLocationId = "L001";

    this.currentSequenceId = 1;

    // HTML SQL editor
    this.sqlInput = null;

    // Current query step
    this.currentQueryStep = null;

    // -------------------------
    // Load case
    // -------------------------

    this.loadCaseSteps();
  }

  // =====================================================
  // LOAD CASE STEPS
  // =====================================================

  async loadCaseSteps() {
    try {
      const response = await fetch(
        "http://localhost:3000/api/cases/C001/steps"
      );

      if (!response.ok) {
        throw new Error(
          `HTTP error: ${response.status}`
        );
      }

      const data = await response.json();

      console.log(
        "CASE STEPS:",
        JSON.stringify(data, null, 2)
      );

      this.caseSteps = data;

      this.createNPCs();

    } catch (error) {
      console.error(
        "Failed to load case steps:",
        error
      );
    }
  }

  // =====================================================
  // CREATE NPCS
  // =====================================================

  createNPCs() {
    this.npcs = [];

    const npcMap = new Map();

    for (const step of this.caseSteps) {
      if (!step.dialogue) {
        continue;
      }

      if (
        step.locationId !==
        this.currentLocationId
      ) {
        continue;
      }

      if (!step.dialogue.npc) {
        continue;
      }

      const npc = step.dialogue.npc;

      if (!npcMap.has(npc.id)) {
        npcMap.set(npc.id, npc);
      }
    }

    const npcPositions = {
      N001: {
        x: 250,
        y: 300,
      },

      N002: {
        x: 600,
        y: 300,
      },
    };

    for (const npc of npcMap.values()) {
      const position =
        npcPositions[npc.id];

      if (!position) {
        continue;
      }

      const sprite =
        this.add.rectangle(
          position.x,
          position.y,
          50,
          70,
          0xc0392b
        );

      this.add.text(
        position.x - 30,
        position.y + 50,
        npc.npcName,
        {
          fontSize: "18px",
          color: "#ffffff",
        }
      );

      this.npcs.push({
        id: npc.id,
        name: npc.npcName,
        x: position.x,
        y: position.y,
        sprite: sprite,
      });
    }

    console.log(
      "NPCs created:",
      this.npcs
    );
  }

  // =====================================================
  // UPDATE
  // =====================================================

  update() {
    // -------------------------
    // Dialogue open
    // -------------------------

    if (this.dialogueOpen) {
      if (
        Phaser.Input.Keyboard.JustDown(
          this.interactKey
        )
      ) {
        this.closeDialogue();
      }

      return;
    }

    // -------------------------
    // SQL computer open
    // -------------------------

    if (this.sqlComputerOpen) {
      return;
    }

    // -------------------------
    // Player movement
    // -------------------------

    const speed = 3;

    if (
      this.cursors.left.isDown ||
      this.keys.A.isDown
    ) {
      this.player.x -= speed;
    }

    if (
      this.cursors.right.isDown ||
      this.keys.D.isDown
    ) {
      this.player.x += speed;
    }

    if (
      this.cursors.up.isDown ||
      this.keys.W.isDown
    ) {
      this.player.y -= speed;
    }

    if (
      this.cursors.down.isDown ||
      this.keys.S.isDown
    ) {
      this.player.y += speed;
    }

    // -------------------------
    // Keep player inside screen
    // -------------------------

    this.player.x =
      Phaser.Math.Clamp(
        this.player.x,
        25,
        775
      );

    this.player.y =
      Phaser.Math.Clamp(
        this.player.y,
        75,
        565
      );

    // -------------------------
    // Find nearby NPC
    // -------------------------

    const nearbyNPC =
      this.getNearbyNPC();

    // -------------------------
    // Interact
    // -------------------------

    if (
      nearbyNPC &&
      Phaser.Input.Keyboard.JustDown(
        this.interactKey
      )
    ) {
      this.showDialogue(
        nearbyNPC
      );
    }
  }

  // =====================================================
  // FIND NEARBY NPC
  // =====================================================

  getNearbyNPC() {
    let nearestNPC = null;

    let nearestDistance =
      Infinity;

    for (const npc of this.npcs) {
      const distance =
        Phaser.Math.Distance.Between(
          this.player.x,
          this.player.y,
          npc.x,
          npc.y
        );

      if (
        distance < 80 &&
        distance < nearestDistance
      ) {
        nearestNPC = npc;

        nearestDistance =
          distance;
      }
    }

    return nearestNPC;
  }

  // =====================================================
  // SHOW DIALOGUE
  // =====================================================

  showDialogue(npc) {
    if (this.dialogueOpen) {
      return;
    }

    // Find current story step
    const currentStep =
      this.caseSteps.find(
        (step) =>
          step.sequenceId ===
          this.currentSequenceId
      );

    if (!currentStep) {
      console.log(
        "No current story step."
      );

      return;
    }

    // Current step must be dialogue
    if (!currentStep.dialogue) {
      console.log(
        "Current step is not dialogue."
      );

      return;
    }

    // Check correct NPC
    if (
      currentStep.dialogue.npc.id !==
      npc.id
    ) {
      console.log(
        "Wrong NPC for current story step."
      );

      return;
    }

    this.dialogueOpen = true;

    const dialogue =
      currentStep.dialogue;

    const dialogueText =
      dialogue.dialoguesList.join(
        "\n"
      );

    // -------------------------
    // Dialogue box
    // -------------------------

    this.dialogueBox =
      this.add.rectangle(
        400,
        500,
        700,
        130,
        0x111111
      );

    this.dialogueText =
      this.add.text(
        80,
        450,
        `${npc.name}: ${dialogueText}`,
        {
          fontSize: "20px",
          color: "#ffffff",
          wordWrap: {
            width: 640,
          },
        }
      );

    this.promptText =
      this.add.text(
        650,
        545,
        "Press E",
        {
          fontSize: "16px",
          color: "#aaaaaa",
        }
      );

    console.log(
      "Current story step:",
      currentStep.id
    );

    console.log(
      "Current dialogue:",
      dialogue.id
    );
  }

  // =====================================================
  // CLOSE DIALOGUE
  // =====================================================

  closeDialogue() {
    this.dialogueOpen = false;

    if (this.dialogueBox) {
      this.dialogueBox.destroy();
    }

    if (this.dialogueText) {
      this.dialogueText.destroy();
    }

    if (this.promptText) {
      this.promptText.destroy();
    }

    // -------------------------
    // Advance story
    // -------------------------

    const currentStep =
      this.caseSteps.find(
        (step) =>
          step.sequenceId ===
          this.currentSequenceId
      );

    if (!currentStep) {
      return;
    }

    this.currentSequenceId++;

    console.log(
      "Story advanced to sequence:",
      this.currentSequenceId
    );

    const nextStep =
      this.caseSteps.find(
        (step) =>
          step.sequenceId ===
          this.currentSequenceId
      );

    if (!nextStep) {
      console.log(
        "Case completed."
      );

      return;
    }

    console.log(
      "Next story step:",
      nextStep.id
    );

    // -------------------------
    // If next step is query
    // open computer
    // -------------------------

    if (nextStep.query) {
      this.openSQLComputer(
        nextStep
      );
    }
  }

  // =====================================================
  // OPEN SQL COMPUTER
  // =====================================================

  openSQLComputer(step) {
    this.sqlComputerOpen = true;

    this.currentQueryStep = step;

    console.log(
      "Opening SQL computer for:",
      step.query.id
    );

    // -------------------------
    // Dark overlay
    // -------------------------

    this.sqlOverlay =
      this.add.rectangle(
        400,
        300,
        800,
        600,
        0x000000,
        0.8
      );

    // -------------------------
    // Computer window
    // -------------------------

    this.sqlWindow =
      this.add.rectangle(
        400,
        300,
        700,
        500,
        0x1e1e1e
      );

    // -------------------------
    // Computer title
    // -------------------------

    this.sqlTitle =
      this.add.text(
        170,
        75,
        "DETECTIVE'S COMPUTER",
        {
          fontSize: "28px",
          color: "#ffffff",
        }
      );

    // -------------------------
    // Query question
    // -------------------------

    this.sqlQuestion =
      this.add.text(
        120,
        130,
        "Find the dish ordered by Vikram Malhotra.",
        {
          fontSize: "20px",
          color: "#ffffff",
          wordWrap: {
            width: 560,
          },
        }
      );

    // -------------------------
    // SQL editor background
    // -------------------------

    this.sqlEditor =
      this.add.rectangle(
        400,
        300,
        560,
        180,
        0x111111
      );

    // -------------------------
    // Create HTML textarea
    // -------------------------

    this.createSQLInput();

    // -------------------------
    // Execute button
    // -------------------------

    this.executeButton =
      this.add.rectangle(
        400,
        430,
        180,
        50,
        0x4caf50
      );

    this.executeButtonText =
      this.add.text(
        345,
        415,
        "EXECUTE",
        {
          fontSize: "20px",
          color: "#ffffff",
        }
      );

    // -------------------------
    // Close button
    // -------------------------

    this.closeComputerButton =
      this.add.rectangle(
        700,
        100,
        40,
        40,
        0xc0392b
      );

    this.closeComputerText =
      this.add.text(
        691,
        106,
        "X",
        {
          fontSize: "20px",
          color: "#ffffff",
        }
      );

    // -------------------------
    // Execute button
    // -------------------------

    this.executeButton.setInteractive();

    this.executeButton.on(
      "pointerdown",
      () => {
        this.executeSQLQuery();
      }
    );

    // -------------------------
    // Close button
    // -------------------------

    this.closeComputerButton.setInteractive();

    this.closeComputerButton.on(
      "pointerdown",
      () => {
        this.closeSQLComputer();
      }
    );
  }

  // =====================================================
  // CREATE HTML SQL INPUT
  // =====================================================

  createSQLInput() {
    this.sqlInput =
      document.createElement(
        "textarea"
      );

    this.sqlInput.value =
      "SELECT * FROM guests;";

    this.sqlInput.placeholder =
      "Write your SQL query here...";

    // -------------------------
    // Get Phaser canvas position
    // -------------------------

    const canvas =
      this.game.canvas;

    const canvasRect =
      canvas.getBoundingClientRect();

    // -------------------------
    // Position textarea
    // -------------------------

    this.sqlInput.style.position =
      "fixed";

    this.sqlInput.style.left =
      `${canvasRect.left + 120}px`;

    this.sqlInput.style.top =
      `${canvasRect.top + 215}px`;

    this.sqlInput.style.width =
      "560px";

    this.sqlInput.style.height =
      "170px";

    this.sqlInput.style.boxSizing =
      "border-box";

    // -------------------------
    // Styling
    // -------------------------

    this.sqlInput.style.background =
      "#111111";

    this.sqlInput.style.color =
      "#ffffff";

    this.sqlInput.style.border =
      "1px solid #555555";

    this.sqlInput.style.padding =
      "12px";

    this.sqlInput.style.fontSize =
      "18px";

    this.sqlInput.style.fontFamily =
      "monospace";

    this.sqlInput.style.resize =
      "none";

    this.sqlInput.style.outline =
      "none";

    this.sqlInput.style.zIndex =
      "1000";

    // -------------------------
    // Add to page
    // -------------------------

    document.body.appendChild(
      this.sqlInput
    );

    // Automatically focus
    this.sqlInput.focus();
  }

  // =====================================================
  // EXECUTE SQL QUERY
  // =====================================================

  async executeSQLQuery() {
    if (!this.sqlInput) {
      return;
    }

    if (!this.currentQueryStep) {
      return;
    }

    const sql =
      this.sqlInput.value.trim();

    if (!sql) {
      console.log(
        "Please enter a SQL query."
      );

      return;
    }

    const queryId =
      this.currentQueryStep.query.id;

    console.log(
      "Sending SQL query:",
      sql
    );

    console.log(
      "Query ID:",
      queryId
    );

    try {
      const response =
        await fetch(
          `http://localhost:3000/api/queries/${queryId}/execute`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              sql: sql,
            }),
          }
        );

      const data =
        await response.json();

      console.log(
        "QUERY RESPONSE:",
        data
      );

      // -------------------------
      // Correct answer
      // -------------------------

      if (data.correct) {
        console.log(
          "CORRECT SQL QUERY!"
        );

        this.closeSQLComputer();

        this.currentSequenceId++;

        console.log(
          "Story advanced to sequence:",
          this.currentSequenceId
        );

        const nextStep =
          this.caseSteps.find(
            (step) =>
              step.sequenceId ===
              this.currentSequenceId
          );

        if (!nextStep) {
          console.log(
            "Case completed."
          );

          return;
        }

        console.log(
          "Next story step:",
          nextStep.id
        );

        // If next step is another query
        if (nextStep.query) {
          this.openSQLComputer(
            nextStep
          );
        }
      }

      // -------------------------
      // Incorrect answer
      // -------------------------

      else {
        console.log(
          "INCORRECT SQL QUERY."
        );

        this.showQueryResult(
          "✗ Incorrect result. Try again.",
          data.result
        );
      }

    } catch (error) {
      console.error(
        "Failed to execute SQL query:",
        error
      );

      this.showQueryResult(
        "Could not connect to the database."
      );
    }
  }

  // =====================================================
  // SHOW QUERY RESULT
  // =====================================================

  showQueryResult(
    message,
    result = []
  ) {
    // Remove previous result
    if (this.queryResultText) {
      this.queryResultText.destroy();
    }

    // -------------------------
    // Format database result
    // -------------------------

    let resultText = "";

    if (result.length > 0) {
      resultText = result
        .map((row) => {
          return Object.entries(row)
            .map(([column, value]) => {
              return `${column}: ${value}`;
            })
            .join("\n");
        })
        .join("\n\n");
    } else {
      resultText =
        "No rows returned.";
    }

    // -------------------------
    // Display result
    // -------------------------

    this.queryResultText =
      this.add.text(
        150,
        480,
        `${message}\n\nQUERY RESULT:\n${resultText}`,
        {
          fontSize: "16px",
          color: "#ffffff",
          wordWrap: {
            width: 500,
          },
          align: "left",
        }
      );
  }

  // =====================================================
  // CLOSE SQL COMPUTER
  // =====================================================

  closeSQLComputer() {
    this.sqlComputerOpen = false;

    // Remove HTML textarea
    if (this.sqlInput) {
      this.sqlInput.remove();

      this.sqlInput = null;
    }

    // Destroy query result
    if (this.queryResultText) {
      this.queryResultText.destroy();

      this.queryResultText = null;
    }

    // Destroy Phaser elements
    if (this.sqlOverlay) {
      this.sqlOverlay.destroy();
    }

    if (this.sqlWindow) {
      this.sqlWindow.destroy();
    }

    if (this.sqlTitle) {
      this.sqlTitle.destroy();
    }

    if (this.sqlQuestion) {
      this.sqlQuestion.destroy();
    }

    if (this.sqlEditor) {
      this.sqlEditor.destroy();
    }

    if (this.executeButton) {
      this.executeButton.destroy();
    }

    if (this.executeButtonText) {
      this.executeButtonText.destroy();
    }

    if (this.closeComputerButton) {
      this.closeComputerButton.destroy();
    }

    if (this.closeComputerText) {
      this.closeComputerText.destroy();
    }

    this.currentQueryStep = null;
  }

  // =====================================================
  // CLEANUP
  // =====================================================

  shutdown() {
    if (this.sqlInput) {
      this.sqlInput.remove();

      this.sqlInput = null;
    }
  }
}

// =======================================================
// REACT COMPONENT
// =======================================================

export default function Game() {
  const gameContainer =
    useRef(null);

  useEffect(() => {
    const config = {
      type: Phaser.AUTO,

      width: 800,

      height: 600,

      parent:
        gameContainer.current,

      backgroundColor:
        "#1a1a1a",

      scene: MainScene,
    };

    const game =
      new Phaser.Game(config);

    return () => {
      game.destroy(true);
    };
  }, []);

  return (
    <div ref={gameContainer} />
  );
}
