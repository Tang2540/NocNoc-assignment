Cypress.Commands.add('clickOnETax', () => {
    cy.get(".AlLuVrbCsVl7ACTIG9Jk").should("be.visible");
    cy.get('span:contains("E-Tax")').click();
  });

Cypress.Commands.add('clickOnMore_brand', (brand) => {
    cy.get(".AlLuVrbCsVl7ACTIG9Jk")
      .children()
      .children()
      .eq(1)
      .find('button:contains("แสดงเพิ่ม")')
      .click();
    cy.contains("h3", new RegExp(brand, 'i'))
      .parents(".bu-flex .bu-cursor-pointer")
      .click();
})

Cypress.Commands.add('entryFilter', (filter,lowestPrice, highestPrice) => {
    cy.get(`h6:contains(${filter})`)
      .parents(".bu-flex .bu-h-7")
      .click()
      .next()
      .within(() => {
        cy.get('input[placeholder="ต่ำสุด"]').type(lowestPrice);
        cy.get('input[placeholder="สูงสุด"]').type(highestPrice);
      });
})

Cypress.Commands.add('clickToOpen_filter',(filter,param)=>{
  cy.get(`h6:contains(${filter})`)
    .parents(".bu-flex .bu-h-7")
    .click({force: true})
  cy.contains("h3", new RegExp(param, 'i'))
    .parents(".bu-flex .bu-cursor-pointer")
    .click({force: true});
})

Cypress.Commands.add('clickToOpenOnMore_filter',(filter,param)=>{
    cy.get(`h6:contains(${filter})`)
      .parents(".bu-flex .bu-h-7")
      .click({force: true})
      .next()
      .within(() => {
        cy.get('button:contains("แสดงเพิ่ม")').click({force: true});
      });
    cy.contains("h3", new RegExp(param, 'i'))
      .parents(".bu-flex .bu-cursor-pointer")
      .click({force: true});
})

Cypress.Commands.add('getNoResultHandling',()=>{
    cy.get('img[src="https://nocnoc.com/static/images/error.png"]')
      .should("exist")
      .next()
      .within(() => {
        cy.get('h2:contains("ไม่พบสิ่งที่คุณค้นหา")').should("exist");
        cy.get('p:contains("ลองลดตัวกรองการค้นหาลง")').should("exist");
        cy.get(".bu-shrink-0 .bu-typography-caption-3").should("not.exist");
      });
})