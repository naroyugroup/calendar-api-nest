import { MigrationInterface, QueryRunner } from "typeorm";

export class AddEventEntity1712873227196 implements MigrationInterface {
	name = "AddEventEntity1712873227196";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`--sql
      CREATE TABLE "event" (
        "id"              uuid NOT NULL DEFAULT uuid_generate_v4(),
        "google_id"       text,
        "calendar_id"     integer NOT NULL,
        "summary"         text NOT NULL,
        "description"     text,
        "location"        text,
        "recurrence_rule" text,
        "creator"         text NOT NULL,
        "organizer"       text NOT NULL,
        "attendee"        text array,
        "created"         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated"         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),

        CONSTRAINT "PK_30c2f3bbaf6d34a55f8ae6e4614" PRIMARY KEY ("id"),
        CONSTRAINT "FK_30d40d7e1d263072ea51d54ec1c" FOREIGN KEY ("calendar_id")
          REFERENCES "calendar"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )`
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`DROP TABLE "event"`);
	}
}
