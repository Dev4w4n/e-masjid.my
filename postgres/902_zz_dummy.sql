-- >>>>> START KHAIRAT
ALTER TABLE IF EXISTS members RENAME TO khairat_members;
ALTER TABLE IF EXISTS members_tags RENAME TO khairat_members_tags;
ALTER TABLE IF EXISTS tags RENAME TO khairat_tags;
ALTER TABLE IF EXISTS dependents RENAME TO khairat_dependents;

INSERT INTO person ("name",ic_number,address,phone) VALUES
	 ('Abu Bakar','111111111111','Permatang Ara','0123456789'),
	 ('Isteri 1','222222222222','Permatang Ara','0123456789'),
	 ('Anak 1','333333333333','Permatang Ara','0123456789'),
	 ('Anak 2','444444444444','Permatang Ara','0123456789'),
	 ('Omar','555555555555','Permatang Ara','0123456789'),
	 ('Ali','666666666666','Permatang Ara','0123456789'),
	 ('Salman','777777777777','Permatang Ara','0123456789'),
	 ('Osman','888888888888','Permatang Ara','0123456789');

INSERT INTO khairat_members (person_id) VALUES
	 (1),
	 (5),
	 (6),
	 (7),
	 (8);

INSERT INTO khairat_members_tags (member_id,tags_id) VALUES
	 (1,1),
	 (2,1),
	 (3,1),
	 (4,2);

INSERT INTO khairat_dependents (member_id,person_id,hubungan_id) VALUES
	 (1,2,6), -- isteri 1
	 (1,3,1), -- anak 1
	 (1,4,1); -- anak 2

INSERT INTO khairat_payment_history (member_id,amount,payment_date,no_resit) VALUES
	 (1,90,1711527052000,'X90'),
	 (2,50,1711527052000,'X50');
-- <<<<< END KHAIRAT

-- >>>>> START TABUNG KUTIPAN
INSERT INTO kutipan (tabung_id,total1c,total5c,total10c,total20c,total50c,total1d,total5d,total10d,total20d,total50d,total100d,create_date) VALUES
	 (1,0,0,0,0,0,320,100,30,10,3,1,(extract(epoch from now())-(6*604800)) * 1000), -- previous 6 week
	 (1,0,0,0,0,0,250,120,35,11,4,0,(extract(epoch from now())-(5*604800)) * 1000), -- previous 5 week
	 (1,0,0,0,0,0,280,70,25,9,5,2,  (extract(epoch from now())-(4*604800)) * 1000), -- previous 4 week
	 (1,0,0,0,0,0,380,50,40,12,2,1, (extract(epoch from now())-(3*604800)) * 1000), -- previous 3 week
	 (1,0,0,0,0,0,300,90,20,8,3,0,  (extract(epoch from now())-(2*604800)) * 1000), -- previous 2 week
	 (1,0,0,0,0,0,450,110,15,13,7,0,(extract(epoch from now())-(1*604800)) * 1000), -- previous 1 week
	 (1,0,0,0,0,0,500,130,50,15,8,3,(extract(epoch from now())           ) * 1000); -- current day
-- <<<<< END TABUNG KUTIPAN

-- >>>>> START CADANGAN
INSERT INTO cadangan (cadangan_types_id,cadangan_text,tindakan_text,cadangan_nama,cadangan_email,cadangan_phone,is_open,score,create_date) VALUES
	 (2,'Duis sit amet nisi finibus.','','Ahmad 1','ahmad1@email.com','0113456780',false,3,1709251200),
	 (2,'Integer semper justo nec lectus.','','Ahmad 2','ahmad2@email.com','0123556781',false,4,1709337600),
	 (2,'Aliquam erat volutpat.','','Ahmad 3','ahmad3@email.com','0133656782',false,5,1709424000),
	 (2,'Curabitur finibus leo nec.','','Ahmad 4','ahmad4@email.com','0143756783',false,3,1709510400),
	 (2,'Maecenas et mollis neque.','','Ahmad 5','ahmad5@email.com','0153856784',false,4,1709596800),
	 (2,'Vestibulum sed fermentum dolor.','','Ahmad 6','ahmad6@email.com','0163956785',false,5,1709683200),
	 (2,'Nunc fermentum orci eu rhoncus.','','Ahmad 7','ahmad7@email.com','0174056786',false,5,1709769600),
	 (2,'Nulla eu ornare erat, eu posuere.','','Ahmad 8','ahmad8@email.com','0184156787',false,5,1709856000),
	 (2,'Aenean ut lorem lacus.','','Ahmad 9','ahmad9@email.com','0194256788',false,5,1709942400),
	 (3,'Nam fermentum aliquam finibus.','','Ahmad 10','ahmad10@email.com','0114356789',false,4,1710028800),
	 (3,'Nunc iaculis, risus ac bibendum.','','Ahmad 11','ahmad11@email.com','0124456790',true,4,1710115200),
	 (1,'Donec at consequat metus.','','Ahmad 12','ahmad12@email.com','0134556791',true,5,1710201600),
	 (1,'Aenean commodo metus ultrices.','','Ahmad 13','ahmad13@email.com','0144656792',true,3,1710288000),
	 (1,'Orci varius natoque penatibus.','','Ahmad 14','ahmad14@email.com','0154756793',true,4,1710374400),
	 (1,'Sed et vehicula nunc.','','Ahmad 15','ahmad15@email.com','0164856794',true,5,1710460800);
-- <<<<< END CADANGAN
