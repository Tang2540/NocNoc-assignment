describe("Search result page", () => {
  beforeEach(() => {
    cy.visit(
      "https://nocnoc.com/pl/All?area=search&st=%E0%B9%80%E0%B8%84%E0%B8%A3%E0%B8%B7%E0%B9%88%E0%B8%AD%E0%B8%87%E0%B8%97%E0%B8%B3%E0%B8%99%E0%B9%89%E0%B8%B3%E0%B8%AD%E0%B8%B8%E0%B9%88%E0%B8%99"
    );
  });

  it("User clicks on product card", () => {
    cy.window().then((win) => {
      cy.stub(win, "open").as("windowOpen");
    });

    cy.get(".product-list")
      .children()
      .first()
      .find("a")
      .then(($link) => {
        let href = $link.attr("href");
        if (href.includes("?")) {
          href = href.split("?")[0];
        }
        cy.wrap($link).click();
        cy.get("@windowOpen").should(
          "be.calledWith",
          Cypress.sinon.match((url) => {
            return url.includes(href);
          }, `URL includes href without query: ${href}`)
        );
      });
  });

  it("User hovers on product images", () => {
    cy.get(".product-list").should('be.visible')
      .children()
      .each(($child, i) => {
        if (i < 5) {
          cy.wrap($child)
            .children()
            .children()
            .find(".bximg")
            .trigger("mouseover")
            .within(() => {
              cy.get(
                '.fc2XTkDBtQFzj0gh7QmL > .slick-slider > .slick-list > .slick-track > [data-index="1"]'
              ).should("be.visible");
            });
        }
      });
  });

  it("Verify prices of discounted products", () => {
    cy.get(".product-list")
      .children()
      .each(($child, i) => {
        if (i < 5) {
          cy.wrap($child)
            .children()
            .children()
            .find(".bxdetail")
            .within(() => {
              cy.get(
                ".\\!bu-mt-auto > .price > .a > .bu-typography-numeric-medium-1"
              )
                .invoke("text")
                .then((text) => {
                  const price = parseInt(text.replace(/,/g, ""));
                  cy.wrap(price).as("discountedPrice");
                });

              cy.get(
                ".\\!bu-mt-auto > .price > .off-price > .actual > .original-price"
              )
                .invoke("text")
                .then((text) => {
                  const price = parseInt(text.replace(/[^\d]/g, ""));
                  cy.wrap(price).as("originalPrice");
                });

              cy.get(
                ".\\!bu-mt-auto > .price > .off-price > .actual > .discount-text"
              )
                .invoke("text")
                .then((text) => {
                  const price = parseInt(text.replace(/[^\d]/g, ""));
                  cy.wrap(price).as("diffrentiatePrice");
                });

              cy.get("@discountedPrice").then((discounted) => {
                cy.get("@originalPrice").then((original) => {
                  cy.get("@diffrentiatePrice").then((diff) => {
                    const checkPrice = original - diff;
                    expect(discounted).to.equal(checkPrice);
                  });
                });
              });
            });
        }
      });
  });

  it("User clears filters", () => {
    cy.get('button:contains("กรองการค้นหา")').click();
    cy.get(".AlLuVrbCsVl7ACTIG9Jk");
    cy.clickOnMore_brand("Stiebel");
    cy.clickToOpenOnMore_filter("ชื่อร้านค้า", "Sahapaiboon HomeCenter");
    cy.get(".bu-inline-flex").should("be.visible");
    cy.get(".\\!bu-text-semantic-support-blue-fg-on-low").click();
    cy.get(".bu-inline-flex").should("not.exist");
  });

  it("Filter with multiple filter combinations", () => {
    cy.get('button:contains("กรองการค้นหา")').click();
    cy.clickOnETax();
    cy.clickOnMore_brand("Electrolux");
    cy.entryFilter("กำลังไฟฟ้า (วัตต์)", "4000", "6000");
    cy.entryFilter("ราคา", "2000", "5000");
    cy.clickToOpen_filter(
      "บริการประกอบ/ติดตั้ง",
      "สินค้าที่มีบริการประกอบ/ติดตั้งฟรีจากผู้ขาย"
    );
    cy.get(".product-list")
      .children()
      .each(($child) => {
        cy.wrap($child)
          .find('img[src="/static/images/e-tax.png"]')
          .should("be.visible");
        cy.wrap($child)
          .children()
          .children()
          .find(".bxdetail")
          .within(() => {
            cy.get("div")
              .eq(0)
              .children()
              .eq(1)
              .should("include", /Electrolux/i);

            cy.get(".bu-min-h-\\[42px\\] > .bu-min-h-\\[2rem\\]")
              .find('span:contains("ติดตั้งฟรี")')
              .should("be.visible");

            cy.get(
              ".bu-min-h-8.bu-text-semantic-gray-neutral-fg-mid-on-white > .\\[\\&\\:not\\(\\:last-child\\)\\]\\:after\\:bu-content-\\[\\'_\\|_\\'\\]"
            )
              .should("exist")
              .invoke("text")
              .then((text) => {
                const match = text.match(/\d+/);
                if (match) {
                  const number = parseInt(match[0], 10);
                  try {
                    expect(number).to.be.within(4000, 6000);
                  } catch (error) {
                    assert.fail(
                      `Validation failed for number: ${number}. Error: ${error.message}`
                    );
                  }
                } else {
                  cy.log("No number found in the text");
                }
              });

            cy.get(
              ".\\!bu-mt-auto > .price > .a > .bu-typography-numeric-medium-1"
            )
              .should("be.visible")
              .invoke("text")
              .then((text) => {
                const number = parseInt(text.replace(/,/g, ""));
                if (isNaN(number)) {
                  assert.fail(
                    `Validation failed: Unable to parse a valid number from the text "${text}".`
                  );
                } else if (number < 2000 || number > 5000) {
                  assert.fail(
                    `Validation failed: Number ${number} is not within the range 2000-5000.`
                  );
                } else {
                  cy.log(
                    `Validation succeeded: Number ${number} is within the range 2000-5000.`
                  );
                }
              });
          });
      });
  });

  it("User filter with non-match multiple filter combinations", () => {
    cy.get('button:contains("กรองการค้นหา")').click();
    cy.clickOnETax();
    cy.clickOnMore_brand("Panasonic");
    cy.get('h6:contains("ชื่อร้านค้า")').parents(".bu-flex .bu-h-7").click({force:true});
    cy.contains("h3", /Baanpraporn electronic/i)
      .parents(".bu-flex .bu-cursor-pointer")
      .click();
    cy.getNoResultHandling();
  });


  it("Entry extreme price range in filter inputs", () => {
    const inputPrice = 5;
    cy.get('button:contains("กรองการค้นหา")').click();
    cy.entryFilter("ราคา", "5", "5");
    cy.wait(5000);
    cy.get(`h6:contains("ราคา")`)
      .parents(".bu-flex .bu-h-7")
      .next()
      .within(() => {
        cy.get('input[placeholder="ต่ำสุด"]')
          .invoke("val")
          .then((val) => {
            const inputVal = parseInt(val);
            cy.wrap(inputVal).as("inputLowestVal");
          });
        cy.get('input[placeholder="สูงสุด"]')
          .invoke("val")
          .then((val) => {
            const inputVal = parseInt(val);
            cy.wrap(inputVal).as("inputHighestVal");
          });
        cy.wait(5000);

        cy.get("@inputLowestVal").then((lowVal) => {
          expect(lowVal).to.not.equal(inputPrice);
        });
        cy.get("@inputLowestVal").then((lowVal) => {
          expect(lowVal).to.not.equal(inputPrice);
        });
      });
  });

  it("User entry extreme low prices in price filter inputs", () => {
    const inputWatt = 5;
    cy.get('button:contains("กรองการค้นหา")').click();
    cy.entryFilter("กำลังไฟฟ้า (วัตต์)", "5", "5");
    cy.wait(5000);
    cy.get(`h6:contains("กำลังไฟฟ้า (วัตต์)")`)
      .parents(".bu-flex .bu-h-7")
      .next()
      .within(() => {
        cy.get('input[placeholder="ต่ำสุด"]')
          .invoke("val")
          .then((val) => {
            const inputVal = parseInt(val);
            cy.wrap(inputVal).as("inputLowestVal");
          });
        cy.get('input[placeholder="สูงสุด"]')
          .invoke("val")
          .then((val) => {
            const inputVal = parseInt(val);
            cy.wrap(inputVal).as("inputHighestVal");
          });
        cy.wait(5000);

        cy.get("@inputLowestVal").then((lowVal) => {
          expect(lowVal).to.not.equal(inputWatt);
        });
        cy.get("@inputLowestVal").then((lowVal) => {
          expect(lowVal).to.not.equal(inputWatt);
        });
      });
  });

  it("User entry Thai characters in price filter inputs", () => {
    const inputWatt = "กขค";
    cy.get('button:contains("กรองการค้นหา")').click();
    cy.entryFilter("กำลังไฟฟ้า (วัตต์)", "5", "5");
    cy.wait(5000);
    cy.get(`h6:contains("กำลังไฟฟ้า (วัตต์)")`)
      .parents(".bu-flex .bu-h-7")
      .next()
      .within(() => {
        cy.get('input[placeholder="ต่ำสุด"]')
          .invoke("val")
          .then((val) => {
            const inputVal = parseInt(val);
            cy.wrap(inputVal).as("inputLowestVal");
          });
        cy.get('input[placeholder="สูงสุด"]')
          .invoke("val")
          .then((val) => {
            const inputVal = parseInt(val);
            cy.wrap(inputVal).as("inputHighestVal");
          });
        cy.wait(5000);

        cy.get("@inputLowestVal").then((lowVal) => {
          expect(lowVal).to.not.equal(inputWatt);
        });
        cy.get("@inputLowestVal").then((lowVal) => {
          expect(lowVal).to.not.equal(inputWatt);
        });
      });
  });

  it("User entry Thai characters in power range filter inputs", () => {
    const inputPrice = "กขค";
    cy.get('button:contains("กรองการค้นหา")').click();
    cy.entryFilter("ราคา", "5", "5");
    cy.wait(5000);
    cy.get(`h6:contains("ราคา")`)
      .parents(".bu-flex .bu-h-7")
      .next()
      .within(() => {
        cy.get('input[placeholder="ต่ำสุด"]')
          .invoke("val")
          .then((val) => {
            const inputVal = parseInt(val);
            cy.wrap(inputVal).as("inputLowestVal");
          });
        cy.get('input[placeholder="สูงสุด"]')
          .invoke("val")
          .then((val) => {
            const inputVal = parseInt(val);
            cy.wrap(inputVal).as("inputHighestVal");
          });
        cy.wait(5000);

        cy.get("@inputLowestVal").then((lowVal) => {
          expect(lowVal).to.not.equal(inputPrice);
        });
        cy.get("@inputLowestVal").then((lowVal) => {
          expect(lowVal).to.not.equal(inputPrice);
        });
      });
  });


});
